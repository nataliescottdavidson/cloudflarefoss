const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Web Crypto API example</title>
    <link rel="stylesheet" href="style.css">
  </head>

  <body>
    <main>
      <h1>Web Crypto: sign/verify</h1>
      <section class="examples">
        <section class="sign-verify rsassa-pkcs1">
          <h2 class="sign-verify-heading">RSASSA-PKCS1-v1_5</h2>
          <section class="sign-verify-controls">
            <div class="message-control">
              <label for="rsassa-pkcs1-message">Enter a message to sign:</label>
              <input type="text" id="rsassa-pkcs1-message" name="message" size="25"
                     value="The owl hoots at midnight">
            </div>
            <div class="signature">Signature:<span class="signature-value"></span></div>
            <input class="sign-button" type="button" value="Sign" onclick='callSignMessage()'>
            <input class="verify-button" type="button" value="Verify" onclick='callVerifyMessage()'>
          </section>
        </section>
  </body>
  <script> function callSignMessage() {
      fetch(window.location.pathname, {
          method: 'POST',
      })
  }
  function callVerifyMessage() {
    fetch(window.location.pathname, {
        method: 'PUT',
    })
  }
  </script>
</html>`


function signMessage(privateKey) {
  console.log(privateKey)
}

function verifyMessage(publicKey) {
  console.log(publicKey)
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

/**
 * Respond to the request
 * @param {Request} request
 */
async function handleRequest(request) {

  let keyPair = await self.crypto.subtle.generateKey(
      {
        name: "RSASSA-PKCS1-v1_5",
        // Consider using a 4096-bit key for systems that require long-term security
        modulusLength: 512,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256",
      },
      true,
      ["sign", "verify"]
  );

  if (request.method == 'POST') {
    response = await signMessage(keyPair.privateKey);
  }
  if (request.method == 'PUT') {
    response = await verifyMessage(keyPair.privateKey)
  }

  return new Response(html, {
    headers: {'Content-Type': `text/html`}
  })
}