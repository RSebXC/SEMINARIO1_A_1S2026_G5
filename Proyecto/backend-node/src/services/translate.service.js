const { TranslateTextCommand } = require('@aws-sdk/client-translate');
const { translateClient } = require('../config/aws');
const IDIOMAS = { en:'English', fr:'Français', de:'Deutsch', pt:'Português' };
async function traducirTexto(texto, idiomaDestino, idiomaOrigen='auto') {
  const res = await translateClient.send(new TranslateTextCommand({
    Text:texto, SourceLanguageCode:idiomaOrigen, TargetLanguageCode:idiomaDestino
  }));
  return { textoOriginal:texto, textoTraducido:res.TranslatedText, idiomaDestino };
}
function obtenerIdiomas() {
  return [{ codigo:'es',nombre:'Español' }, ...Object.entries(IDIOMAS).map(([k,v])=>({ codigo:k,nombre:v }))];
}
module.exports = { traducirTexto, obtenerIdiomas };
