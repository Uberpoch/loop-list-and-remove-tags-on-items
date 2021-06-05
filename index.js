const axios = require('axios');
const fs = require('fs');

const clientID = '';
const secretKey = '';

const stream = 6369093;

const auth = async (key, secret) => {
    return axios.post('https://v2.api.uberflip.com/authorize', {
        grant_type:	'client_credentials',
        client_id: key,
        client_secret: secret
    })
    .catch(function (error) {
        console.log(error);
        })
    .then(function (response) {
        // tokenType = response.data.token_type;
        token = response.data.access_token;
        return token;
    });

}

const listItems = async (token, stream) => {
    let url = `https://v2.api.uberflip.com/streams/${stream}/items?limit=50&page=1`;
    let returnedItems = [];
    let totalItems;
        
    async function call(url, token){
    axios.get(url, {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'User_Agent': `Nathan UF`
            }
        })
        .catch(error => {
            console.log(error);
            })
        .then(res => {
            let next = res.data.meta.next_page;
            let objs = res.data.data;
            
            objs.forEach(obj => returnedItems.push(obj));

                if(totalItems !== returnedItems.length){
                    totalItems = res.data.meta.count;
                    console.log(`returnedItems: ${returnedItems.length}, totalItems: ${totalItems}`);
                    call(next,token);
                }
                else {
                    console.log(`returnedItems: ${returnedItems.length} = totalItems: ${totalItems}`);
                    listLoop(token, returnedItems);
                }
            
        });   

    }
    if(totalItems === undefined){
        call(url, token);
    }
}

const listTagsOnItems = async (token, item) => {
    axios.get(`https://v2.api.uberflip.com/items/${item}/tags?limit=100`,
    {
        headers: { 
            'Authorization': `Bearer ${token}`,
            'User_Agent': `Nathan UF`
        }
    })
    .catch(err => {
        console.log(err);
    })
    .then(res => {
        let deleteTags = {
            id: item,
            tags: res.data.data
        };
        deleteLoop(token, deleteTags);
    })
}

const deleteTagsOnItems = async (token, itemId, tagId) => {
    axios.delete(`https://v2.api.uberflip.com/items/${itemId}/tags/${tagId}`,
    {
        headers:{ 
            'Authorization': `Bearer ${token}`,
            'User_Agent': `Nathan UF`
        }
    })
}

const listLoop = async (token, array) => {
    array.forEach(async item => {
        const tagsList = await listTagsOnItems(token, item.id);
    })
}

const deleteLoop = async (token, obj) => {
    var array = obj.tags;
    var id = obj.id;
    array.forEach(item => {
        deleteTagsOnItems(token, id, item.id);
    });

}

const run = async function(){
    const token = await auth(clientID, secretKey);
    console.log('token created');
    const itemArray = await listItems(token, stream);

    
};
run();