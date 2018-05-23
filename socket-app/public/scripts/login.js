
document.getElementById('home').addEventListener('click', function(){
	window.location = 'index.hbs';
});

document.getElementById('article').addEventListener('click', function(){
	window.location = 'articles.hbs';
	
});

document.getElementById('writers').addEventListener('click', function(){
	window.location = "writers.hbs";
	
});

document.getElementById('login').addEventListener('click', function(){
	window.location = "login.hbs";
	
});


function errorCheck(){
	var errorForm = document.getElementById("errorForm");
	
	fetch('/errorCheck').then(function(response){
		if(response.status !== 200){
			console.log('problem with ajax call!' + response.status + 'msg: ' + response.value);
			return
		}
		response.text().then( function(data) {
			
			var dataJSON = JSON.parse(data);
			
			//console.log(dataJSON);
			//console.log("recieved back:" + data);
			
			console.log(dataJSON.length);
			
			for(var i = 0; i < dataJSON.length; i++){
				errorForm.innerHTML = errorForm.innerHTML + "<p class='errorMessage'>" + dataJSON[i].msg + "</p>"
				
			};
			
		})
	});
};

window.onload = function(){
	errorCheck();
};