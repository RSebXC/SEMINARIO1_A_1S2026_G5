require('dotenv').config();
const { SignUpCommand, ConfirmSignUpCommand, InitiateAuthCommand, UpdateUserAttributesCommand } = require('@aws-sdk/client-cognito-identity-provider');
const { cognitoClient } = require('../config/aws');
const CLIENT_ID = process.env.COGNITO_CLIENT_ID;
async function registrarUsuario({ email, password, nombreCompleto, dpi }) {
  const res = await cognitoClient.send(new SignUpCommand({
    ClientId:CLIENT_ID, Username:email, Password:password,
    UserAttributes:[{ Name:'email',Value:email },{ Name:'name',Value:nombreCompleto },{ Name:'custom:dpi',Value:dpi }]
  }));
  return { userSub:res.UserSub, confirmationRequired:!res.UserConfirmed };
}
async function confirmarCodigo({ email, codigo }) {
  await cognitoClient.send(new ConfirmSignUpCommand({ ClientId:CLIENT_ID, Username:email, ConfirmationCode:codigo }));
}
async function loginUsuario({ email, password }) {
  const res = await cognitoClient.send(new InitiateAuthCommand({
    AuthFlow:'USER_PASSWORD_AUTH', ClientId:CLIENT_ID,
    AuthParameters:{ USERNAME:email, PASSWORD:password }
  }));
  return res.AuthenticationResult;
}
async function actualizarPerfil({ accessToken, nombreCompleto, dpi }) {
  const attrs = [];
  if (nombreCompleto) attrs.push({ Name:'name', Value:nombreCompleto });
  if (dpi) attrs.push({ Name:'custom:dpi', Value:dpi });
  if (attrs.length) await cognitoClient.send(new UpdateUserAttributesCommand({ AccessToken:accessToken, UserAttributes:attrs }));
}
module.exports = { registrarUsuario, confirmarCodigo, loginUsuario, actualizarPerfil };
