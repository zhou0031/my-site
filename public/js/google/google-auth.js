async function onSignIn(googleUser) {
    var id_token = googleUser.getAuthResponse().id_token
   
    try{
          await fetch("/user/google",{
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body:JSON.stringify({id_token})
        })
        .then(response=>response.json())
        .then(feedback=>{
          if(feedback.signedin)
            window.location.replace("/user/index")
        })
    }catch(error){
      console.log("Error: "+error)
    }
}

async function signOut() {
  var auth2 = await gapi.auth2.getAuthInstance()
  auth2.signOut().then(function () {
    console.log("google user signed out")
    document.getElementById("google-signout-form").submit()
  }); 
} 

async function init() {
  await gapi.load('auth2', function() {
     gapi.auth2.init({client_id:"1068886102451-j4q5205p9iihcu64gpces34c2qeh4lup.apps.googleusercontent.com"})
  });
}

