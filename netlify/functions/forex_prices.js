const FixParser = require('fixparser');

exports.handler = async function (event, context) {
  const HOST = process.env.CTRADER_HOST;
  const PORT = parseInt(process.env.CTRADER_PORT);
  const SENDER_COMP_ID = process.env.CTRADER_SENDER_COMP;
  const TARGET_COMP_ID = process.env.CTRADER_TARGET_COMP_ID;
  const SENDER_SUB_ID = process.env.CTRADER_SUB_ID;
  const PASSWORD = process.env.CTRADER_PASSWORD;

  const fixParser = new FixParser();
  const fixClient = fixParser.createClient(PORT, HOST);

  return new Promise((resolve) => {
    const prices = {};
    const symbols = ['XAUUSD', 'USDJPY', 'EURUSD'];

    fixClient.on('open', () => {
      fixClient.logon({
        BeginString: 'FIX.4.4',
        SenderCompID: SENDER_COMP_ID,
        TargetCompID: TARGET_COMP_ID,
        SenderSubID: SENDER_SUB_ID,
        Password: PASSWORD,
        HeartBtInt: 30,
        MsgSeqNum: 1
      });

      fixClient.on('logon', () => {
        symbols.forEach((symbol, i) => {
          const reqId = `REQ${i + 1}`;
          const message = fixParser.createMessage(
            ['8', 'FIX.4.4'],
            ['35', 'V'],
            ['262', reqId],
            ['263', '1'],
            ['264', '1'],
            ['146', '1'],
            ['55', symbol],
            ['267', '2'],
            ['269', '0'],
            ['269', '1']
          );
          fixClient.send(message);
        });
      });

      fixClient.on('message', (msg) => {
        if (msg.messageType === 'W') {
          const symbol = msg.getField(55)?.value;
          const entry = msg.getComponents(268)?.[0]?.getField(270)?.value;
          if (symbol && entry) {
            prices[symbol] = parseFloat(entry);
          }

          if (Object.keys(prices).length === symbols.length) {
            fixClient.close();
            resolve({
              statusCode: 200,
              body: JSON.stringify(prices)
            });
          }
        }
      });
    });

    fixClient.on('error', (err) => {
      resolve({
        statusCode: 500,
        body: JSON.stringify({ error: 'FIX connection failed', detail: err.message })
      });
    });
  });
};
