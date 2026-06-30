export async function onRequestPost(context){

const body=await context.request.json();

const response=await fetch(context.env.GOOGLE_SCRIPT_URL,{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify(body)
});

const result=await response.text();

return new Response(result,{
headers:{
"Content-Type":"application/json",
"Access-Control-Allow-Origin":"*"
}
});

}// JavaScript Document