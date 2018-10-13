



//Event Listeners for header
document.getElementById('home').addEventListener('click', function(){
	window.location = 'index.html';
});

document.getElementById('article').addEventListener('click', function(){
	window.location = 'articles.html';
	
});

document.getElementById('writers').addEventListener('click', function(){
	window.location = "writers.html";
	
});

document.getElementById('login').addEventListener('click', function(){
	window.location = "login.html";
	
});

function loadArticles(){
	var ContentPane = document.getElementById("contentPane");
	
	fetch('/getArticles').then(function(response){
		if(response.status !== 200){
			console.log('problem with ajax call!' + response.status + 'msg: ' + response.value);
			return
		}
		response.text().then( function(data) {
			
			var dataJSON = JSON.parse(data);
			
			console.log(dataJSON);
			console.log("recieved back:" + data);
			

			
			for(var i = 0; i < dataJSON.length; i++){
				contentPane.innerHTML = contentPane.innerHTML + 
				"<div class='article' id='article'"+ i +">" + 
				"<div class='articleImg'>" + 
				"<img src='images/uploads/" + dataJSON[i].imgLoc + "'></img>" +
				"</div>" +
				"<div class='articleTitle'>" +
				"<h3>" + dataJSON[i].title + "</h3>" +
				"</div>" + 
				"<div class='articleDescript'>" +
				"<p>" + dataJSON[i].descript + "</p>" +
				"</div>" +
				"</div>";
				
			};
			
		})
	});
}

document.body.onclick = function(e){
	if (window.event) {
        e = event.srcElement;
    }
    else {
        e = e.target;
    }

    if (e.className && e.className.indexOf('someclass') != -1) {
        
        //window.location =
    }
};

window.onload = function(){
	loadArticles();
};