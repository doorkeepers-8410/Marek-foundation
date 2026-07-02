export async function onRequest(context) {

  if (context.request.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405
    });
  }

  const body = await context.request.json();

  /************************************************
   * VERIFY CLOUDFLARE TURNSTILE
   ************************************************/

  const verifyResponse = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        secret: context.env.TURNSTILE_SECRET_KEY,
        response: body.turnstileToken
      })
    }
  );

  const verification = await verifyResponse.json();

  if (!verification.success) {

    return new Response(
      JSON.stringify({
        success: false,
        error: "Turnstile verification failed."
      }),
      {
        status: 403,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      }
    );

  }

  /************************************************
   * REMOVE TOKEN BEFORE SENDING TO APPS SCRIPT
   ************************************************/

  delete body.turnstileToken;

  /************************************************
   * SEND TO GOOGLE APPS SCRIPT
   ************************************************/

  const response = await fetch(
    context.env.PARTNER_SCRIPT_URL,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    }
  );

  const result = await response.text();

  return new Response(result, {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });

}