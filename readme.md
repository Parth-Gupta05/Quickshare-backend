Room and File Upload Routes
1. Create Room
endpoint: /rooms/createroom
req ex: {
    "roomcode":"apple",
    "allowotherstodropdocs":false,
    "time":10  // time in minutes 
}
response: {
    "room": {
        "roomcode": "apple",
        "files": [],
        "allowotherstodropdocs": false,
        "createdAt": "1761314688698",
        "activetill": 1761315288698,
        "_id": "68fb8780c9bd0c88d35503f1",
        "__v": 0
    },
    "message": "apple created successfully"
}

2. Join Room
endpoint: /rooms/joinroom
req ex: {"roomcode":"apple"}
response:{
    "room": "apple",
    "parsedredisdata": [
        {
            "format": "pdf",
            "createdAt": "2025-10-24T14:05:19Z",
            "pages": 2,
            "size": 94780,
            "url": "https://res.cloudinary.com/dkutcr19q/image/upload/v1761314319/rfzbtuf5wbdujc4l1o32.pdf",
            "originalName": "Uploaded file name",
            "roomcode": "apple",
            "ip": "::1"  // ip address of uploading pc  ::1 in case of localhost
        }
    ]
}

3. Fileupload routes:  
endpoint: /file-upload/upload
req ex:{
    roomcode: "apple",
    file: //list of files in multipart/form-data,
    time: 10  // in minutes
}
response: {
    "message": "ok",
    "uploadedfilesname": [
        //list of files name
    ],
    "metadata": [
        {
            "format": "pdf",
            "createdAt": "2025-10-24T14:08:00Z",
            "pages": 2,
            "size": 94780,
            "url": "https://res.cloudinary.com/dkutcr19q/image/upload/v1761314874/kazmbcpombme2ykek928.pdf",
            "originalName": "Uploaded file name",
            "roomcode": "apple",
            "ip": "::1"  //ip address of uploding pc, ::1 in case of localhost
        },
    uploadFailed:[]
    ]
}


User Routes:

1. Signup
endpoint: /user/signup
req ex:{
    "userName":"sample",
    "email":"sample@gmail.com",
    "password":"password"
}
res: User will be registered and logged in also token will be set in cookies

2. Login
endpoint: /user/login
req ex:{
    "email":"sample@gmail.com",
    "password":"password"
}
res:token will be set in cookies

3. Delete user
endpoint: /user/deleteuser
req: just hit the endpoint without body
response: user will be deleted

4. Logout
endpoint: /user/logout
req: just hit the endpoint without body
response: user will be logged out

5. User check
endpoint: /auth/check
req: just hit the endpoint without body
response: {
    "loggedin": true,
    "user": {
        "email": "sample@gmail.com",
        "username": "sample",
        "iat": 1761316440
    }
}