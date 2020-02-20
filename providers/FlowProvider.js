const Flow = require('../models/Flow');
const { parseQuery, buildQuery } = require('express-extra-tool').functions;
const { declareCRUD } = require('express-extra-tool').mongoose;
const mongoose = require('mongoose');
const CURD = declareCRUD(Flow, 'Flow');

const { getFlow, createFlow } = CURD;

const { getManyBlock, createManyBlock } = _rq('providers/BlockProvider');
const { getTag, updateTag } = _rq('providers/TagProvider');

/**
 * Clone flow to another page
 * @param {*} flowId
 * @param {*} from
 * @param {*} target
 * @param {*} userId
 */
async function cloneFlow(flowId, from, target, userId) {
  let [flow, blocksData] = await Promise.all([
    getFlow({ _id: flowId, user_id: userId, page_id: from }),
    getManyBlock(
      {
        flow_id: flowId,
        user_id: userId
      },
      { pagination: false }
    )
  ]);

  if (!flow) throw 'Không tìm thấy kịch bản';

  const newFlowData = {
    ...flow,
    name: flow.name + ' - Sao chép',
    _id: new mongoose.Types.ObjectId().toHexString(),
    page_id: target
  };

  const blockIdsMap = {};
  // const flowIdsMap = {};
  const tagIdsMap = {};

  // Clone flow
  let blocks = blocksData.map(block => {
    const newId = mongoose.Types.ObjectId().toHexString();
    blockIdsMap[block._id] = newId;
    return {
      ...block,
      flow_id: newFlowData._id,
      page_id: target,
      _id: newId
    };
  });

  let tasks = [];
  blocks.forEach(block => {
    // if (block.next_flow_id) {
    //   tasks.push(
    //     new Promise(async (resolve, reject) => {
    //       cloneFlow(block.next_flow_id, from, target, userId)
    //         .then(fId => {
    //           resolve({ before: block.next_flow_id, after: fId, type: 'flow' });
    //         })
    //         .catch(error => {
    //           resolve({
    //             before: block.next_flow_id,
    //             after: null,
    //             type: 'flow'
    //           });
    //         });
    //     })
    //   );
    // }

    if (
      block.type === 'action' &&
      block.content.actions &&
      block.content.actions.length
    ) {
      block.content.actions.forEach(action => {
        if (action.tags && action.tags.length) {
          action.tags.forEach(tagId => {
            tagIdsMap[tagId] = null;
          });
        }
      });
    }
  });

  console.log(tagIdsMap);

  Object.entries(tagIdsMap).forEach(e => {
    tasks.push(
      new Promise(async (resolve, reject) => {
        const tag = await getTag({ _id: e[0] });
        if (!tag) {
          resolve({});
          return;
        }
        const newTag = await updateTag(
          {
            name: tag.name,
            color: tag.color,
            type: tag.type,
            page_id: target,
            user_id: userId
          },
          {
            name: tag.name,
            color: tag.color,
            type: tag.type,
            page_id: target,
            user_id: userId
          },
          {
            upsert: true
          }
        );

        resolve({
          before: e[0],
          after: newTag._id,
          type: 'tag'
        });
      })
    );
  });

  let rs = await Promise.all(tasks);
  console.log(rs);
  rs.forEach(e => {
    // if(e.type === 'flow') {
    //   flowIdsMap[e.before] = e.after;
    // }

    if (e.type === 'tag') {
      tagIdsMap[e.before] = e.after;
    }
  });

  blocks.map(block => {
    block.flow_id = newFlowData._id;

    if (block.next_block_id) {
      block.next_block_id = blockIdsMap[block.next_block_id];
    }

    // if (block.next_flow_id) {
    //   block.next_flow_id = flowIdsMap[block.next_flow_id];
    // }

    // copy next block id of button
    if (
      block.type === 'message' &&
      block.content.cards &&
      block.content.cards.length
    ) {
      block.content.cards.forEach(card => {
        if (
          ['button', 'image', 'video'].includes(card.type) &&
          card.buttons &&
          card.buttons.length
        ) {
          card.buttons.forEach(button => {
            if (button.type === 'postback') {
              const payload = parseQuery(button.payload, '+');
              payload.block = blockIdsMap[payload.block];
              button.payload = buildQuery(payload, '+');
            }
          });
        }

        if (card.type === 'generic') {
          card.elements.forEach(element => {
            element.buttons.forEach(button => {
              if (button.type === 'postback') {
                const payload = parseQuery(button.payload, '+');
                payload.block = blockIdsMap[payload.block];
                button.payload = buildQuery(payload, '+');
              }
            });
          });
        }
      });
    }

    // copy action tag
    if (
      block.type === 'action' &&
      block.content.actions &&
      block.content.actions.length
    ) {
      block.content.actions.forEach(action => {
        if (
          ['add-tag', 'remove-tag'].includes(action.type) &&
          action.tags &&
          action.tags.length
        ) {
          action.tags = action.tags.map(tag => tagIdsMap[tag]);
        }
      });
    }
  });

  const [newFlow, listBlock] = await Promise.all([
    createFlow(newFlowData),
    createManyBlock(blocks)
  ]);

  return {
    newFlow,
    listBlock
  };
}

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

module.exports = {
  ...CURD,
  cloneFlow
};
