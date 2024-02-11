import { format } from "date-fns";
import receiptline from "receiptline";
import sharp from "sharp";
import { Printer, Image } from "@node-escpos/core";
import USB from "@node-escpos/usb-adapter";
import Bluetooth from "@node-escpos/bluetooth-adapter";
import config from "config";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import readline from "readline";

if (
  !config.has("mode") ||
  !config.has("shop.name") ||
  !config.has("shop.address") ||
  !config.has("firebase")
) {
  throw new Error("config is not set");
}

if (config.get("mode") !== "usb" && config.get("mode") !== "bluetooth") {
  throw new Error("mode is not valid");
}

let device: Bluetooth | USB = new Bluetooth("", null);
let mode = config.get("mode");
const app = initializeApp(config.get("firebase"));
const db = getFirestore(app);

// wait 3 seconds
function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function getPaymentMethod(type: "cash" | "square", total: number) {
  if (type === "cash") {
    return "現金 | ¥" + total;
  } else if (type === "square") {
    return "電子決済 | ¥" + total;
  }
}

type OrderData = {
  createdAt: Timestamp;
  deviceId: string;
  items: {
    name: string;
    price: number;
    quantity: number;
  }[];
  amount: number;
  deposit: number;
  type: "cash" | "square";
  orderedAt: Timestamp;
  orderId: string;
  receiptId: string;
};

async function printLatestTransaction(orderData: OrderData) {
  let res: any = [];
  try {
    const totalQuantity = orderData.items.reduce(
      (acc, item) => acc + item.quantity,
      0
    );
    const data = `

    ${config.get("shop.name")}
    ${config.get("shop.address")}
    {width:*,12}
    ${format(orderData.createdAt.toDate(), "yyyy/MM/dd HH:mm")} | ID:${
      orderData.deviceId
    }

    {width: *}
    領 収 書

    ーーーーーーーーーーーーーー

    {width:*,10}
    ${orderData.items
      .map((item) => {
        if (item.quantity > 1) {
          return `${item.name} |\n    {width:10,3,13}\n    | ¥${item.price} | ${
            item.quantity
          }個 | ¥${item.price * item.quantity}\n    {width:*,10}\n`;
        } else {
          return `${item.name} | ¥${item.price}\n`;
        }
      })
      .join("")}
    {width:4,*,10}
    小計 | ${totalQuantity}点 | ¥${orderData.amount}

    {width:*,10}
    ^合計 | ^¥${orderData.amount}

    ${getPaymentMethod(orderData.type, orderData.deposit)}
    お釣り | ^¥${orderData.deposit - orderData.amount}

    {width:*}
    ーーーーーーーーーーーーーー

    {code:${orderData.receiptId}; option:code128,2,60,hri}
    `;
    const printerInfo: receiptline.Printer = {
      cpl: 32,
      encoding: "cp932",
      upsideDown: false,
      command: "svg",
    };
    const command = receiptline.transform(data, printerInfo);
    if (mode === "usb") {
      device = new USB();
      device.open(async function (err: any) {
        if (err) {
          return;
        }
        const options = {};
        let printer = new Printer(device, options);
        sharp(Buffer.from(command))
          .png()
          .toFile("temp.png")
          .then(async () => {
            const img = await Image.load("temp.png");
            const print = await printer.image(img);
            print.cut().close().then(() => {
              device.close();
            });
          });
      });
    } else if (mode === "bluetooth") {
      device.open(async function (err: any) {
        if (err) {
          return;
        }
        const options = {};
        let printer = new Printer(device, options);
        sharp(Buffer.from(command))
          .png()
          .toFile("temp.png")
          .then(async () => {
            const img = await Image.load("temp.png");
            const print = await printer.image(img);
            print.cut().close().then(() => {
              device.close();
            });
          });
      });
    }
    console.log("Success");
    return JSON.stringify({ res });
  } catch (e) {
    if (e instanceof Error) {
      console.log(e.message);
    } else {
      console.log(e);
    }
    return JSON.stringify({ res });
  }
}

const unsub = onSnapshot(collection(db, "CURRENT_ORDER"), (snapshot) => {
  snapshot.forEach((doc) => {
    const data = doc.data() as OrderData;
    if (data.type !== undefined) {
      printLatestTransaction(data);
    }
  });
});

const reader = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log("Press any key to exit");

reader.on("close", function () {
  unsub();
  console.log("[EXIT]");
});
