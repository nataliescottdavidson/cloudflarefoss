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
          headers: {'Content-Type': 'text'},
          body: messagetxt
      }).then(response => { response.text() .then(text => {
        let sigfield = document.getElementById("signature-value")
        sigfield.innerText = text
      }) })
     
  }
  function callVerifyMessage() {
    fetch(window.location.pathname, {
        method: 'PUT'
    }).then(response => { response.text() .then(text => {
        let sigfield = document.getElementById("signature-value")
        sigfield.innerText = text
      }) })
  }
  </script>
</html>`


async function signMessage(hmacKey, rawMessage) {
  let enc = new TextEncoder();
  let encoded = enc.encode(rawMessage);
  let signature = await self.crypto.subtle.sign(
      "HMAC",
      hmacKey,
      encoded
  );
  return signature;
}

async function verifyMessage(hmacKey, rawMessage, signature) {
  console.log(hmacKey)
  console.log(rawMessage)
  console.log(signature)
  let enc = new TextEncoder();
  let encoded = enc.encode(rawMessage);
  let result = await self.crypto.subtle.verify(
      "HMAC",
      hmacKey,
      signature,
      encoded
  );
  return result;
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

function str2ab(str) {
  var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
  var bufView = new Uint16Array(buf);
  for (var i=0, strLen=str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}
function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint16Array(buf));
}

async function handleRequest(request) {
  let key = await self.crypto.subtle.generateKey(
      {
        name: "HMAC",
        hash: "sha-256"
      },
      true,
      ["sign", "verify"]
  );

  if (request.method == 'POST') {
    let rawMessage = await request.text()
    let signature = await signMessage(key, rawMessage)
    console.log(signature)
    let strab = ab2str(signature)
    console.log(strab)
    await NAT_TODO.put("sig", strab)
    await NAT_TODO.put("msg", rawMessage)
    return new Response(signature)
  }
  if (request.method == 'PUT') {
    let signature = await NAT_TODO.get("sig")
    let rawMessage = await NAT_TODO.get("msg")
    console.log(signature)
    let abstr = str2ab(signature)
    console.log(abstr)
    let result = await verifyMessage(key, rawMessage, abstr)
    return new Response(result)
  }

  return  new Response(html, {
    headers: {'Content-Type': `text/html`}})
}