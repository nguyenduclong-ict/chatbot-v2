const admin = require("firebase-admin");
const APP_NAME = "genius";
const PROJECT_NAME = "mrcom";
const { PAGE_ACCESS_TOKEN, PAGE_ID, PAGE_NAME } = _get(
  require(__dirroot + "/config"),
  "facebook/genius/pages/jarvis"
);
const Sender = require(__dirroot + "/utils/facebookMessage").init({
  PAGE_ACCESS_TOKEN
});

async function handleMessage(event) {
  _log(event);
  const { message, sender } = event;

  // You may get a text or attachment but not both
  var messageText = message.text;
  var messageAttachments = message.attachments;
  var quickReply = message.quick_reply;
  //
  if (messageText) {
    if (messageText.toLowerCase().trim() === "register:notification") {
      Sender.sendTypingOn(sender);
      // add reciver order notification
      admin
        .firestore()
        .collection("accounts")
        .where("id", "==", sender.id)
        .where("app", "==", APP_NAME)
        .where("page", "==", PAGE_NAME)
        .where("type", "==", "facebook")
        .where("project", "==", PROJECT_NAME)
        .get()
        .then(async snapshot => {
          if (snapshot.empty) {
            let userInfo = {};
            try {
              const response = await Sender.getUserInfo(sender.id);
              userInfo = response.data;
            } catch (err) {
              console.error(err);
              userInfo = {};
            }
            _log(userInfo);
            // add new reciver
            admin
              .firestore()
              .collection("accounts")
              .add({
                id: sender.id,
                active: false,
                type: "facebook",
                app: APP_NAME,
                page: PAGE_NAME,
                name: userInfo.name,
                avatar: userInfo.profile_pic,
                project: PROJECT_NAME
              })
              .then(() => {
                Sender.sendTextMessage(
                  sender,
                  "Đăng kí thành công, vui lòng chờ admin xác nhận!"
                );
              });
          } else {
            Sender.sendTextMessage(sender, "Bạn đã đăng kí trước đó rồi!");
          }
        });
    } else {
      Sender.sendTextMessage(sender, messageText);
    }
  }
}

function handleNotificationOrder(req, res) {
  const body = req.body;
  const { title, money, phone, address, time, details } = body;
  const message = `🌟Đơn hàng mới : 🌟
📞 ${phone}
🏠 ${address}
⏰ ${time}
------------
✢Chi tiết :
${details.map(detail => `* x${detail.quantity} : ${detail.food}`).join("\n")}
-----------
💵 ${parseInt(money).toLocaleString("vn")}đ
`;

  admin
    .firestore()
    .collection("accounts")
    .where("type", "==", "facebook")
    .where("app", "==", APP_NAME)
    .where("page", "==", PAGE_NAME)
    .where("active", "==", true)
    .get()
    .then(snapshot => {
      const arr = snapshot.docs.map(doc => {
        _log(doc.data().id);
        return Sender.sendTextMessage(doc.data(), message);
      });
      Promise.all(arr);
    });
}

module.exports = {
  PAGE_ACCESS_TOKEN,
  PAGE_ID,
  handleMessage,
  handleNotificationOrder
};
