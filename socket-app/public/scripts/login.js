
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


//server call to check for errors, errors are processed in the registration post rout and added to a seperate error handling file
//on window load the page checksif anything had been added to the error file and displays the errors
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
			
			console.log('Number Of Errors: ' + dataJSON.length);
			
			for(var i = 0; i < dataJSON.length; i++){
				errorForm.innerHTML = errorForm.innerHTML + "<p class='errorMessage'>" + dataJSON[i].msg + "</p>"
				
			};
			
		})
	});
};

//call error check on page load
window.onload = function(){
	errorCheck();
};