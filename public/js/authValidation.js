document.addEventListener("DOMContentLoaded",()=>{
      //signup validation
const signupForm=document.getElementById("signupForm")

if(signupForm){
signupForm.addEventListener("submit",function(e){
  e.preventDefault()

   const name=document.getElementById("name").value.trim()
    const email=document.getElementById("email").value.trim()
    const  phone= document.getElementById("phone").value.trim()
    const password=document.getElementById("password").value.trim()
    const confirmPassword=document.getElementById("confirmPassword").value.trim()

if(!name||!email||!phone||!password||!confirmPassword){
     swal("Error", "Please fill all fields", "warning");
      return;
}

const nameValid=/^[A-Za-z\s]+$/
if(!nameValid.test(name)){
      swal("Error", "Name should contain letters only", "error");
      return;
}

const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
if (!emailValid.test(email)) {
  swal("Error", "Please enter a valid email address", "error");
  return;
}

const phoneValid= /^\d{10}$/
if(!phoneValid.test(phone)){
     swal("Error", "Phone Number should be 10 digits", "error");
      return;
}

const passwordValid = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{6,}$/
if(!passwordValid.test(password)){
    swal("Error", "Password must be at least 6 characters and include letters, numbers, and symbols", "error");
    return;
}


if(password!==confirmPassword){
      swal("Error", "Passwords do not match", "error");
      return;
}

 const btn = document.getElementById("createBtn");
    btn.disabled = true;
    btn.innerText = "Processing..."; 

signupForm.submit()


})
}

// login validation
const loginForm=document.getElementById("loginForm")

if(loginForm){
loginForm.addEventListener("submit",(e)=>{
      e.preventDefault()

      const email=document.getElementById("email").value.trim()
      const password=document.getElementById("password").value.trim()

      if(!email||!password){
       swal("Error", "Please fill all fields", "warning");
      return;
      }

       const emailValid = /^[^\s:@]+@[^\s@]+\.[^\s@]+$/
      if (!emailValid.test(email)) {
       swal("Error", "Please enter a valid email address", "error");
        return;
        }

        const passwordValid = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{6,}$/
        if(!passwordValid.test(password)){
         swal("Error", "Password must be at least 6 characters and include letters, numbers, and symbols", "error");
          return;
         }
         
      const btn = document.getElementById("loginBtn");
      btn.disabled = true;
      btn.innerText = "Processing...";
          loginForm.submit();
})

}

})