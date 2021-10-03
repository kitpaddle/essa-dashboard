// JS SCRIPT AFFECTING THE HTML MAIN PAGE

let selectedId = "a-info";

function menuClick(el){
  selectedId = el.id;
  document.getElementById("a-info").style.background = 'rgb(90,90,90)';
  document.getElementById("a-fotgangare").style.background = 'rgb(90,90,90)';
  document.getElementById("a-cyklister").style.background = 'rgb(90,90,90)';
  document.getElementById("a-bilister").style.background = 'rgb(90,90,90)';
  el.style.background = 'rgb(100,100,100)';

  document.getElementById("t-info").style.display = 'none';
  document.getElementById("t-fotgangare").style.display = 'none';
  document.getElementById("t-cyklister").style.display = 'none';
  document.getElementById("t-bilister").style.display = 'none';
  switch(selectedId){
    case "a-info":
      document.getElementById("t-info").style.display = 'block';
      break;
    case "a-fotgangare":
      document.getElementById("t-fotgangare").style.display = 'block';
      break;
    case "a-cyklister":
      document.getElementById("t-cyklister").style.display = 'block';
      break;
    case "a-bilister":
      document.getElementById("t-bilister").style.display = 'block';
      break;
  }
}

function onHover(el){
  if (el.id!=selectedId){
    el.style.background = 'rgb(255, 145, 0)';
  }
}

function outHover(el){
  if(el.id!=selectedId){
    el.style.background = 'rgb(90,90,90)';
  }
}