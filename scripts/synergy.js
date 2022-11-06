

console.log("starting synergy script")




chrome.storage.local.get(["courseInfos"], (result) => {
    //console.log(result.courseInfos)
})


var wrapper = document.createElement("div")
wrapper.classList.add("Box")
wrapper.style.padding = "5px"
wrapper.style = `
    position: fixed;
    z-index: 500;
    top: 500px;
    left: 200px;

    width: 200px;
    height: 200px;

    background-color: gray;

`

var title = document.createElement("h3")
title.textContent = "Canvas To Synergy"

wrapper.appendChild(title)

//document.getElementById("html").appendChild(wrapper)






