require('dotenv').config();
const { RecognizeTextCommand } = require('@aws-sdk/client-lex-runtime-v2');
const { lexClient } = require('../config/aws');
const { randomUUID } = require('crypto');
async function enviarMensajeLex(mensaje, sessionId=null) {
  const sid = sessionId || randomUUID();
  const res = await lexClient.send(new RecognizeTextCommand({
    botId:process.env.LEX_BOT_ID, botAliasId:process.env.LEX_BOT_ALIAS_ID,
    localeId:process.env.LEX_LOCALE_ID||'es_US', sessionId:sid, text:mensaje
  }));
  const msgs = (res.messages||[]).map(m=>m.content).join(' ');
  return { sessionId:sid, respuesta:msgs, intent:res.sessionState?.intent?.name };
}
module.exports = { enviarMensajeLex };
