
const Sequelize = require('sequelize');

var sequelize = new Sequelize('dfrch302b18uul', 'kwbnnkwgxyalrb', '3cd2fa600dbd50ba75d41d2d7c7432343fab5805bf3d643495f59c49b4f6ed57', {
    host: 'ec2-52-3-60-53.compute-1.amazonaws.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
    ssl: { rejectUnauthorized: false }},
    query: { raw: true }
 });

var Post = sequelize.define('Post', {
    body: Sequelize.TEXT,
    title: Sequelize.STRING,
    postDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN
});

var Category = sequelize.define('Category', {
    category: Sequelize.STRING
});

Post.belongsTo(Category, {foreignKey: 'category'});

module.exports.initialize = function () {
    return new Promise((resolve, reject) => {
        sequelize.sync().then(function () {

            Post.create().then(function (project) {
                console.log("Post: success!");
                resolve(project);
            }).catch(function (error) {
                console.log("something went wrong!");
                reject("unable to sync the database");
            });

            Category.create().then(function (project) {
                console.log("Category: success!");
                resolve(project);
            }).catch(function (error) {
                console.log("something went wrong!");
                reject("unable to sync the database");
            });

        }).catch(function(error){
            console.log("something wrong!" + error);
            reject("unable to sync the database");
        });
    });
}

module.exports.getAllPosts = function(){
    return new Promise((resolve, reject) => {
        Post.findAll().then(function(data){
            resolve(data)
        }).catch(function(error){
            reject("no results returned")
        });
    });
}

module.exports.getPostsByCategory = function(category){
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: { category: category}
        }).then(function(data){
            resolve(data)
        }).catch(function(error){
            reject("no results returned")
        });
    });
}

module.exports.getPostsByMinDate = function(minDateStr){
    return new Promise((resolve, reject) => {
        const { gte } = Sequelize.Op;
        Post.findAll({
            where: {
                postDate: {
                    [gte]: new Date(minDateStr)
                }
            }
        }).then(function(data){
            resolve(data)
        }).catch(function(error){
            reject("no results returned")
        });
    });
}

module.exports.getPostById = function(id){
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: { id: id}
        }).then(function(data){
            resolve(data)
        }).catch(function(error){
            reject("no results returned")
        });
    });
}

module.exports.addPost = function(postData){
    return new Promise((resolve, reject) => {
        
        Object.keys(postData).forEach((key) => {
            if(postData[key] == undefined || postData[key] == ""){
                postData[key] = null;
            }
        });

        postData.published = (postData.published) ? true : false;
        postData.postDate = new Date();

        Post.create(postData).then(function(data){
            resolve(data)
        }).catch(function(error){
            reject("no results returned")
        });
    });
}

module.exports.getPublishedPosts = function(){
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: { published: true}
        }).then(function(data){
            resolve(data)
        }).catch(function(error){
            reject("no results returned")
        });
    });
}

module,exports.getPublishedPostsByCategory = function(category){
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: { 
                published: true,
                category: category
            }
        }).then(function(data){
            resolve(data)
        }).catch(function(error){
            reject("no results returned")
        });
    });
    
}

module.exports.getCategories = function(){
    return new Promise((resolve, reject) => {
        Category.findAll().then(function(data){
            resolve(data)
        }).catch(function(error){
            reject("no results returned")
        });
    });
}

module.exports.addCategory = function(categoryData){
    return new Promise((resolve, reject) => {
        
        Object.keys(categoryData).forEach((key) => {
            if(categoryData[key] == undefined || categoryData[key] == ""){
                categoryData[key] = null;
            }
        });

        Category.create(categoryData).then(function(data){
            resolve(data)
        }).catch(function(error){
            reject("no results returned")
        });
    });
}

module.exports.deleteCategoryById = function(id){
    return new Promise((resolve, reject) => {
        Category.destroy({
            where: { id: id }
        }).then(function(data){
            resolve(data)
        }).catch(function(error){
            reject("was rejected")
        });
    });
}

module.exports.deletePostById = function(id){
    return new Promise((resolve, reject) => {
        Post.destroy({
            where: { id: id }
        }).then(function(data){
            resolve(data)
        }).catch(function(error){
            reject("was rejected")
        });
    });
}