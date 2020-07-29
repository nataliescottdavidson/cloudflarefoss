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
            <div id="signature">Signature:<span id="signature-value"></span></div>
            <input id="sign-button" type="button" value="Sign" onclick='callSignMessage()'>
            <input id="verify-button" type="button" value="Verify" onclick='callVerifyMessage()'>
          </section>
        </section>
  </body>
  <script> function callSignMessage() {
      fetch(window.location.pathname, {
          method: 'POST',
          headers: {'Content-Type': 'json'},
          body: "foobar"
      })
  }
  function callVerifyMessage() {
    fetch(window.location.pathname, {
        method: 'PUT',
    })
  }
  </script>
</html>`

class CryptoElemHandler {
  constructor(keyPair) {
    this.keyPair = keyPair
  }

  element(element) {
    if(element.getAttribute('id') == 'sign-button' ){
      console.log("sign spot")
    }
    else if(element.getAttribute('id') == 'verify-button' ){
      console.log("verify spot")
    }
    else if(element.getAttribute("id") == "signature-value") {
      console.log("sigvalue")
    }
    else if(element.getAttribute("id") == "rsassa-pkcs1-message"){
      //any way to do this?
      console.log(element.value)
    }
  }
}

function signMessage(privateKey) {
  console.log(privateKey)
}

function verifyMessage(publicKey) {
  console.log(publicKey)
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})


async function handleRequest(request) {
  let rewriter = new HTMLRewriter();
  let response = new Response(html, {
    headers: {'Content-Type': `text/html`}})
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
    console.log('POST call', request.body)
    await signMessage(keyPair.privateKey);
    return rewriter.on("*", new CryptoElemHandler())
        .transform(response)

  }
  if (request.method == 'PUT') {
    await verifyMessage(keyPair.privateKey)
    return rewriter.on("*#verify-button", new CryptoElemHandler())
        .transform(response)
  }

  return response
}