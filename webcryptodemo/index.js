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
      var messagetxt = document.getElementById("rsassa-pkcs1-message").value;
      fetch(window.location.pathname, {
          method: 'POST',
          headers: {'Content-Type': 'html/text'},
          body: messagetxt
      }).then(response => { response.text() .then(text => {
        let sigfield = document.getElementById("signature-value")
        sigfield.innerText = text
      }) })
     
  }
  function callVerifyMessage() {
    fetch(window.location.pathname, {
        method: 'PUT',
    })
  }
  </script>
</html>`

let signature;
//very sketchy, global variable


class CryptoElemHandler {
  constructor(keyPair, rawMessage) {
    this.keyPair = keyPair
    this.rawMessage = rawMessage
  }

  element(element) {
    if(element.getAttribute('id') == 'sign-button' ){
      console.log("sign spot")
    }
    else if(element.getAttribute('id') == 'verify-button' ){
      console.log("verify spot")
    }
    else if(element.getAttribute("id") == "signature-value") {
      if(this.rawMessage){
        console.log("have message")
        element.setInnerContent(this.rawMessage)
      }
      else {
        console.log('dont have message')
      }

    }
  }
}

async function signMessage(rawMessage, privateKey) {
  let enc = new TextEncoder();
  let encoded = enc.encode(rawMessage);
  signature = await self.crypto.subtle.sign(
      "RSASSA-PKCS1-v1_5",
      privateKey,
      encoded
  );
  let buffer = new Uint8Array(signature, 0, 5);
  return `${buffer}...[${signature.byteLength} bytes total]`;
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
    let rawMessage = await request.text()
    let signature = await signMessage(rawMessage, keyPair.privateKey)
    let response = new Response(signature)
    return response
  }
  if (request.method == 'PUT') {

    await verifyMessage(keyPair.privateKey)
    response =  rewriter.on("*#verify-button", new CryptoElemHandler())
        .transform(response)
  }

  return rewriter.on("*", new CryptoElemHandler(keyPair, ))
      .transform(response)
}