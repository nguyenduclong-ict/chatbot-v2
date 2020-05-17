const validator = require('validator').default;
const locales = require('./locales.json');
const { graphUrl } = _rq('config').facebook;

/**
 * Make message data from card
 * @param {card} card
 */

function makeMessage(card) {
  let message;
  switch (card.type) {
    case 'button':
      if (!card.text) throw 'Text card required';
      if (card.buttons.length > 0) {
        // button message
        if (card.text.length > 640) {
          throw 'Text of button card cannot lenght > 640 character';
        }
        validateButtons(card.buttons);
        message = {
          attachment: {
            type: 'template',
            payload: {
              template_type: 'button',
              text: card.text,
              buttons: getButtons(card.buttons)
            }
          }
        };
      } else {
        // text message
        if (card.text.lenght > 2000) {
          throw 'Text message limit with 2000 character';
        }
        message = {
          text: card.text
        };
      }
      break;
    case 'generic':
      validateGeneric(card);
      message = {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'generic',
            image_aspect_ratio: card.image_aspect_ratio,
            elements: card.elements.map((element, index) => {
              const t = {
                title: element.title,
                image_url: element.image_url,
                subtitle: element.subtitle
              };
              if (element.buttons && element.buttons.length) {
                t.buttons = getButtons(element.buttons);
              }
              if (element.has_action) {
                t.default_action = element.default_action;
              }
              return t;
            })
          }
        }
      };
      break;
    case 'image':
      validateAttachment(card);
      message = {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'media',
            elements: [
              {
                media_type: 'image',
                attachment_id: card.attachment_id,
                buttons: getButtons(card.buttons)
              }
            ]
          }
        }
      };
      break;
    case 'audio':
      validateAttachment(card);
      message = {
        attachment: {
          type: 'audio',
          payload: {
            url: card.url,
            is_reusable: true
          }
        }
      };
      break;
    case 'video':
      validateAttachment(card);
      message = {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'media',
            elements: [
              {
                media_type: 'video',
                attachment_id: card.attachment_id,
                buttons: getButtons(card.buttons)
              }
            ]
          }
        }
      };
      break;
    case 'file':
      validateAttachment(card);
      message = {
        attachment: {
          type: 'file',
          payload: {
            url: card.url,
            is_reusable: true
          }
        }
      };
      break;
    case 'media':
      message = {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'media',
            elements: elements.map((element, index) => {
              const t = {
                media_type: element.media_type
              };
              if (element.url) t.url = element.url;
              else t.attachment_id = element.attachment_id;
              if (element.buttons) {
                validateButtons(element.buttons);
                t.buttons = getButtons(element.buttons);
              }
              return t;
            })
          }
        }
      };
      break;
    case 'delay':
      message = {
        type: 'delay',
        wait: card.wait
      };
      break;
    default:
      break;
  }
  return message;
}

/**
 *
 */
async function uploadAttachment(url, access_token) {
  try {
    const endpoint = graphUrl + '/me/message_attachments';
    const rs = await axios.post(
      endpoint,
      {
        message: {
          attachment: {
            type: 'image',
            payload: {
              is_reusable: true,
              url
            }
          }
        }
      },
      {
        params: {
          access_token
        }
      }
    );
    return rs.data.attachment_id;
  } catch (error) {
    return null;
  }
}

/**
 *
 * @param {*} buttons
 */
function getButtons(buttons) {
  return buttons.map(button => {
    if (button.type === 'web_url') {
      return _.pick(button, ['title', 'url', 'type', 'webview_height_ratio']);
    }

    if (button.type === 'postback' || button.type === 'phone_number') {
      return _.pick(button, ['title', 'payload', 'type']);
    }
  });
}

// VALIDATE MESSAGE BLOCK --------------------------------------------------------------------------------------

/**
 *
 * @param {card} card
 */

function validateGeneric(card) {
  const { image_aspect_ratio, elements } = card;
  _log(image_aspect_ratio);
  if (!['horizontal', 'square'].includes(image_aspect_ratio)) {
    throw `'image_aspect_ratio' must be 'horizontal' or 'square'`;
  }

  elements.forEach((element, index) => {
    const {
      title,
      subtitle,
      image_url,
      default_action,
      has_action,
      buttons
    } = element;
    if (!title || title.length > 80)
      throw `Generic ${index} 'title' required and limit 80 character`;
    if (subtitle && title.length > 80)
      throw `Generic ${index} 'subtitle' limit 80 character`;
    if (!validator.isURL(image_url))
      throw `Generic ${index} 'image_url' invalid`;
    if (has_action && default_action) {
      validateButtons([{ ...default_action, title: 'aa' }]);
    }
    buttons && validateButtons(buttons);
  });
}
/**
 *
 * @param {array} buttons
 */
function validateButtons(buttons) {
  if (buttons.length > 3) throw 'Button limit from 1 - 3';
  return buttons.every((button, index) => {
    switch (button.type) {
      case 'web_url':
        if (
          [
            !!button.title && button.title.length > 20,
            !validator.isURL(button.url),
            !['compact', 'tall', 'full'].includes(button.webview_height_ratio)
          ].some(e => e)
        ) {
          throw `Button ${index} 'web_url' button invalid`;
        }
        break;
      case 'postback':
        if (
          [
            !!button.title && button.title.length > 20,
            !!button.payload && button.payload.length > 1000
          ].some(e => e)
        ) {
          throw `Button ${index} 'postback' button invalid`;
        }
        break;
      case 'phone_number':
        if (
          [
            !!button.title && button.title.length > 20,
            !validator.isMobilePhone(button.payload)
          ].some(e => e)
        ) {
          throw `Button ${index} 'phone_number' button invalid`;
        }
        break;
      default:
        throw `Button 'type' ${button.type} not acept`;
    }
    return true;
  });
}

/**
 *
 * @param {card} card
 */

function validateAttachment(card) {
  if (!['video', 'audio', 'file', 'image'].includes(card.type)) {
    throw `Attachment 'type' must be 'video'|'audio'|'file'|'image'`;
  }
  if (['video', 'image'].includes(card.type)) {
    if (!card.attachment_id) {
      throw 'Attachment id invalid';
    }
    validateButtons(card.buttons);
  }
  if (!validator.isURL(card.url)) {
    throw `Attachment url invalid`;
  }
}

/**
 *
 * @param {[{locale : string, call_to_actions : []}]} menu
 */
function validatePersistentMenu(menu) {
  return menu.every(
    item =>
      locales.includes(item.locale) && validateButtons(item.call_to_actions)
  );
}

/**
 *
 * @param {[{locale : string, text : string}]} greeting
 */
function validateGreeting(greeting) {
  return greeting.every(
    item => locales.includes(item.locale) && (item.text || '').length < 160
  );
}

/**
 *
 * @param {[{locale : string, text : string}]} greeting
 */
function validateGetStarted(getStarted) {
  return getStarted && getStarted.payload;
}

module.exports = {
  makeMessage,
  validateButtons,
  validatePersistentMenu,
  validateGreeting,
  validateGetStarted
};
