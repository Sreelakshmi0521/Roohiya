function validationSignup(data){

    const errors=[]


    if(!data.name|| !/^[A-Za-z\s]+$/.test(data.name)){
        errors.push("Name should contain letters only")
    }

    if(!data.email||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)){
        errors.push("Invalid email address")
    }

    if (!data.phone || !/^\d{10}$/.test(data.phone)) {
        errors.push("Phone must be 10 digits");
    } else if (/^(\d)\1{9}$/.test(data.phone)) {
        errors.push("enter valid phone number");
    } else if (data.phone === "1234567890" || data.phone === "9876543210") {
        errors.push("enter valid phone number");
    }


    if(!data.password||  !/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{6,}$/.test(data.password)){
        errors.push( "Password must be at least 6 characters and include letters, numbers, and symbols")
    }
    if(data.password!==data.confirmPassword){
        errors.push("passwords do not match ")
        
    }
    return errors
}

function validationLogin(data){
    const errors=[]

    if(!data.email||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)){
        errors.push("Invalid email address")
    }

    if(!data.password||  !/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{6,}$/.test(data.password)){
        errors.push( "Password must be at least 6 characters and include letters, numbers, and symbols")
    }

    return errors


}

module.exports={validationSignup,
    validationLogin

}