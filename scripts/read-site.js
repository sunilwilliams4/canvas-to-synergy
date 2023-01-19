


/*
 |\__/,|   (`\
 |_ _  |.--.) )
 ( T   )     /
(((^_(((/(((_/
meow
*/

// READ CANVAS DATA //


function getPaginationLinks(header) {
    let currentStartIndex = 0
    let currentEndIndex = 0
    let links = {}
    let counter = 0
    while (currentStartIndex != -1 && currentEndIndex != -1 && counter < 50) {
        counter++
        currentStartIndex = header.indexOf("<")
        currentEndIndex = header.indexOf(">")

        let nameEndIndex = header.indexOf(",")
        if (nameEndIndex == -1) nameEndIndex = header.length

        let name = header.slice(header.indexOf("rel="), nameEndIndex)
        
        if (currentStartIndex != -1 && currentEndIndex != -1) {
            links[name] = header.slice(currentStartIndex + 1, currentEndIndex)
            header = header.slice(nameEndIndex + 1)

        }
        

    }
    return links
}


function getData(specifications, accessToken) {

    let donePaginating = false
    let maxPaginations = 100
    let paginationCounter = 0

    let returnJSON = []

    let url = "https://lms.pps.net/api/v1"
    for (let i = 0; i < specifications.length; i++) url += "/" + specifications[i]


    while (!donePaginating && paginationCounter < maxPaginations) {
        paginationCounter++

        let xhr = new XMLHttpRequest()

        xhr.open("GET", url, false)
        xhr.setRequestHeader("Authorization", "Bearer " + accessToken)
        xhr.send()

        let linkHeader = xhr.getResponseHeader("Link")
        if (linkHeader != null) {
            let links = getPaginationLinks(linkHeader)

            if (links[`rel="current"`] == links[`rel="last"`]) donePaginating = true
            url = links[`rel="next"`]
        }
        else donePaginating = true

        returnJSON = returnJSON.concat(JSON.parse(xhr.response))


    }
    return returnJSON
    
}






function getStuff(url, accessToken) {

    let xhr = new XMLHttpRequest()

    xhr.open("GET", url)
    xhr.setRequestHeader("Authorization", "Bearer " + accessToken)
    xhr.send()

    return new Promise((resolve) => {
        xhr.onreadystatechange = () => {
            if (xhr.readyState == 4) resolve(xhr)
        }
    })
}



async function getDataAsync(specifications, accessToken) {

    let donePaginating = false
    let maxPaginations = 100
    let paginationCounter = 0

    let returnJSON = []

    let url = "https://lms.pps.net/api/v1"
    for (let i = 0; i < specifications.length; i++) url += "/" + specifications[i]


    while (!donePaginating && paginationCounter < maxPaginations) {
        paginationCounter++

        let xhr = await getStuff(url, accessToken)

        let linkHeader = xhr.getResponseHeader("Link")
        if (linkHeader != null) {
            let links = getPaginationLinks(linkHeader)

            if (links[`rel="current"`] == links[`rel="last"`]) donePaginating = true
            url = links[`rel="next"`]
        }
        else donePaginating = true

        returnJSON = returnJSON.concat(JSON.parse(xhr.response))


    }
    return returnJSON
    
}




// UI INTEGRATION //


var canvasMenu = document.getElementById("menu")

if (canvasMenu != null) {

var accessToken
var types = []
var overallGradeAssignmentType

var canvasWrapper = document.getElementById("wrapper")

var interfaceButton = document.createElement("button")
interfaceButton.style.width = "100%"
interfaceButton.style.height = "65px"
interfaceButton.style.backgroundColor = "transparent"
interfaceButton.onmouseover = () => { interfaceButton.style.backgroundColor = "rgba(0,0,0,.2)" }
interfaceButton.onmouseleave = () => { interfaceButton.style.backgroundColor = "transparent" }
interfaceButton.style.borderStyle = "none"
interfaceButton.style.transition = "background-color .5s"
var interfaceLogo = document.createElement("img")
interfaceLogo.src = "https://i.imgur.com/XgIwQf9.png"
interfaceLogo.width = 40
interfaceButton.appendChild(interfaceLogo)
canvasMenu.appendChild(interfaceButton)

var mainWrapper = document.createElement("div")
mainWrapper.style.position = "fixed"
mainWrapper.style.top = "0px"
mainWrapper.style.left = canvasMenu.offsetWidth + "px"
mainWrapper.style.backgroundColor = "white"
mainWrapper.style.width = "calc(100% - " + canvasMenu.offsetWidth + "px)"
mainWrapper.style.height = window.innerHeight + "px"
mainWrapper.style.zIndex = "50"
mainWrapper.style.display = "none"

canvasWrapper.appendChild(mainWrapper)



window.onresize = () => {
    mainWrapper.style.left = canvasMenu.offsetWidth + "px"
    mainWrapper.style.backgroundColor = "white"
    mainWrapper.style.width = "calc(100% - " + canvasMenu.offsetWidth + "px)"
    mainWrapper.style.height = window.innerHeight + "px"
}




canvasMenu.onclick = (event) => {
    let clickedOnInterfaceButton = false
    for (let i = 0; i < event.composedPath().length; i++) if (event.composedPath()[i] == interfaceButton) clickedOnInterfaceButton = true
    if (clickedOnInterfaceButton) {
        mainWrapper.style.display = ""
        document.getElementById("not_right_side").style.display = "none"

        let otherIcons = document.getElementsByClassName("ic-icon-svg")
        for (let i = 0; i < otherIcons.length; i++) otherIcons[i].style.fill = "#fff"
        
        let otherNames = document.getElementsByClassName("menu-item__text")
        for (let i = 0; i < otherNames.length; i++) otherNames[i].style.color = "#fff"

        let otherButtons = document.getElementsByClassName("ic-app-header__menu-list-link")
        for (let i = 0; i < otherButtons.length; i++) otherButtons[i].style.backgroundColor = "transparent"

        interfaceButton.style.backgroundColor = "#fff"
        interfaceButton.onmouseover = () => { }
        interfaceButton.onmouseleave = () => { }
    }
    else {
        interfaceButton.style.backgroundColor = "transparent"
        for (let i = 0; i < event.composedPath().length; i++) {
            if (event.composedPath()[i].classList != null && event.composedPath()[i].classList.contains("ic-icon-svg")) event.composedPath()[i].style.fill = "var(--ic-brand-global-nav-ic-icon-svg-fill--active)"
            if (event.composedPath()[i].classList != null && event.composedPath()[i].classList.contains("menu-item__text")) event.composedPath()[i].style.color = "var(--ic-brand-global-nav-ic-icon-svg-fill--active)"
            if (event.composedPath()[i].classList != null && event.composedPath()[i].classList.contains("ic-app-header__menu-list-link")) event.composedPath()[i].style.backgroundColor = "#fff"
        }
    }
}

document.onclick = (event) => {
    if (mainWrapper.style.display == "" && event.composedPath().find(element => element == canvasMenu) == null) {
        let otherIcons = document.getElementsByClassName("ic-icon-svg")
        for (let i = 0; i < otherIcons.length; i++) otherIcons[i].style.fill = "#fff"
        
        let otherNames = document.getElementsByClassName("menu-item__text")
        for (let i = 0; i < otherNames.length; i++) otherNames[i].style.color = "#fff"
    
        let otherButtons = document.getElementsByClassName("ic-app-header__menu-list-link")
        for (let i = 0; i < otherButtons.length; i++) otherButtons[i].style.backgroundColor = "transparent"
    
        interfaceButton.style.backgroundColor = "#fff"

    }
    
}



let headerWrapper = document.createElement("div")
headerWrapper.classList.add("ic-app-nav-toggle-and-crumbs")
headerWrapper.style.fontSize = "1.125rem"
mainWrapper.appendChild(headerWrapper)

let options = document.createElement("button")
options.classList.add("Button", "Button--link", "ic-app-course-nav-toggle")
headerWrapper.appendChild(options)

let headerIcon = document.createElement("i")
headerIcon.classList.add("icon-hamburger")
options.appendChild(headerIcon)


let headerHomeLink = document.createElement("a")
headerHomeLink.classList.add("ellipsable")
headerHomeLink.textContent = "Canvas To Synergy "
headerHomeLink.style.cursor = "pointer"
headerWrapper.appendChild(headerHomeLink)

let headerArrow = document.createElement("span")
headerArrow.style.background = `url("/dist/images/breadcrumb-arrow-light-8702eeae02.svg") no-repeat 50% 50%`
headerArrow.style.backgroundSize = "6px 11px"
headerArrow.style.width = "6px"
headerArrow.style.height = "11px"
headerArrow.style.marginLeft = "9px"
headerArrow.style.marginRight = "9px"
headerArrow.style.display = "inline-block"
headerWrapper.appendChild(headerArrow)

let headerCurrentPage = document.createElement("span")
headerCurrentPage.classList.add("ellipsable")
headerCurrentPage.textContent = ""
headerWrapper.appendChild(headerCurrentPage)





let sideBarWrapper = document.createElement("div")
sideBarWrapper.classList.add("list-view")
sideBarWrapper.style.position = "absolute"
sideBarWrapper.style.width = "192px"
sideBarWrapper.style.left = "0px"
sideBarWrapper.style.top = "100px"
sideBarWrapper.style.overflowY = "hidden"
sideBarWrapper.style.zIndex = "100"
sideBarWrapper.style.display = "block"
mainWrapper.appendChild(sideBarWrapper)

let sideBarContainer = document.createElement("div")
sideBarContainer.classList.add("ic-sticky-frame")
sideBarContainer.style.lineHeight = "1.5"
sideBarContainer.style.listStyle = "none"
sideBarWrapper.appendChild(sideBarContainer)

class SectionLink {
    static allSectionLinks = []
    constructor(name, section) {
        SectionLink.allSectionLinks.push(this)


        this.wrapper = document.createElement("li")
        this.wrapper.classList.add("section")
        sideBarContainer.appendChild(this.wrapper)

        this.link = document.createElement("a")
        this.link.classList.add("home")
        this.link.innerHTML = name + "<br><br>"
        this.link.style.padding = "7px 0px 7px 4px"
        this.link.style.marginBottom = "1px"
        this.link.style.cursor = "pointer"
        this.wrapper.appendChild(this.link)

        this.wrapper.onclick = () => {
            section.open()

            for (let i = 0; i < SectionLink.allSectionLinks.length; i++) {
                if (SectionLink.allSectionLinks[i] == this) SectionLink.allSectionLinks[i].link.classList.add("active")
                else SectionLink.allSectionLinks[i].link.classList.remove("active")
            }
        }
    }

    delete() {
        SectionLink.allSectionLinks.splice(SectionLink.allSectionLinks.indexOf(this), 1)
        this.wrapper.remove()
    }
}



class Loading {
    constructor(size, parent) {
        this.image = document.createElement("img")
        this.image.src = "https://i.imgur.com/XgIwQf9.png"
        this.image.classList.add("loadingImage")
        this.image.style.width = size + "px"
        this.image.style.height = size + "px"
        this.image.style.marginLeft = "10px"
        parent.appendChild(this.image)

    }

    startLoading() {
        this.image.src = "https://i.imgur.com/XgIwQf9.png"
        this.angle = 0
        this.interval = setInterval(this.refresh, 20, this)
    }

    refresh(object) {
        object.angle += .075
        object.image.style.transform = "rotate(" + object.angle + "rad)"
    }

    endAnimation(object) {
        clearInterval(object.interval)
        object.image.style.transform = "rotate(0)"
        object.image.src = "https://i.imgur.com/CFXRbPB.png"
    }
}


class Info {
    constructor(width, text, parent) {
        this.wrapper = document.createElement("span")
        parent.appendChild(this.wrapper)

        this.wrapper.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" x="0" y="0" viewBox="0 0 200 200" enable-background="new 0 0 200 200" xml:space="preserve" fill="currentColor"><path d="M100,127.88A11.15,11.15,0,1,0,111.16,139,11.16,11.16,0,0,0,100,127.88Zm8.82-88.08a33.19,33.19,0,0,1,23.5,23.5,33.54,33.54,0,0,1-24,41.23,3.4,3.4,0,0,0-2.74,3.15v9.06H94.42v-9.06a14.57,14.57,0,0,1,11.13-14,22.43,22.43,0,0,0,13.66-10.27,22.73,22.73,0,0,0,2.31-17.37A21.92,21.92,0,0,0,106,50.59a22.67,22.67,0,0,0-19.68,3.88,22.18,22.18,0,0,0-8.65,17.64H66.54a33.25,33.25,0,0,1,13-26.47A33.72,33.72,0,0,1,108.82,39.8ZM100,5.2A94.8,94.8,0,1,0,194.8,100,94.91,94.91,0,0,0,100,5.2m0,178.45A83.65,83.65,0,1,1,183.65,100,83.73,83.73,0,0,1,100,183.65" transform="translate(-5.2 -5.2)"></path></svg>`
        this.svg = this.wrapper.firstChild
        this.svg.classList.add("info")
        this.svg.style.width = width + "px"

        this.infoPopup = document.createElement("div")
        this.infoPopup.classList.add("infoPopup")
        this.infoPopup.style.opacity = "0.0"
        this.infoPopup.style.display = "none"
        this.infoPopup.innerHTML = text
        this.wrapper.appendChild(this.infoPopup)
        
        this.svg.onmouseenter = () => {
            this.infoPopup.style.display = ""
            this.infoPopup.style.left = (this.wrapper.offsetLeft + this.wrapper.offsetWidth / 2 - this.infoPopup.offsetWidth / 2) + "px"
            this.infoPopup.style.top = (this.wrapper.offsetTop + this.wrapper.offsetHeight + 10) + "px"
            this.infoPopup.style.opacity = "1.0"
        }
        this.svg.onmouseleave = () => {
            this.infoPopup.style.opacity = "0.0"
            window.setTimeout(() => {this.infoPopup.style.display = "none"}, 100)
        }

    }
}



class LoadingBar {
    constructor(parent) {
        this.wrapper = document.createElement("div")
        this.wrapper.style = `
        margin-top: 10px;

        width: 475px;
        height: 10px;
        
        overflow-x: hidden;

        border: 1px solid #ccc;
        border-radius: 3px;

        `
        parent.appendChild(this.wrapper)

        this.indicator = document.createElement("div")
        this.indicator.style = `
        width: 0%;
        height: 100%;

        background-color: green;

        transition: width .375s;
        `
        this.wrapper.appendChild(this.indicator)
    }

    updateStatus(value) {
        this.indicator.style.width = (value * 100) + "%"
    }
}



class Section {
    static allSections = []
    constructor(title) {
        Section.allSections.push(this)

        this.wrapper = document.createElement("div")
        //this.wrapper.classList.add("ic-app-main-content")
        this.wrapper.style.backgroundColor = "white"
        this.wrapper.style.position = "absolute"
        this.wrapper.style.top = "72px"
        this.wrapper.style.left = "225px"
        this.wrapper.style.width = "calc(100% - 225px)"
        this.wrapper.style.height = "calc(100% - 72px)"
        this.wrapper.style.overflowY = "auto"
        this.wrapper.style.display = "none"
        mainWrapper.appendChild(this.wrapper)
        
        this.titleWrapper = document.createElement("div")
        this.titleWrapper.classList.add("title-content")
        this.wrapper.appendChild(this.titleWrapper)

        this.title = document.createElement("h1")
        this.title.classList.add("title")
        this.title.innerHTML = "<br>" + title
        this.titleWrapper.appendChild(this.title)
    }

    open() {
        for (let i = 0; i < Section.allSections.length; i++) {
            if (Section.allSections[i] == this) {
                Section.allSections[i].wrapper.style.display = ""
                headerCurrentPage.textContent = this.title.textContent
            }
            else Section.allSections[i].wrapper.style.display = "none"
        }
    }

    delete() {
        Section.allSections.splice(Section.allSections.indexOf(this), 1)
        this.wrapper.remove()
    }


}


function createTermSelector(parent, includeLabel) {

    if (includeLabel) {
        let termSelectorLabel = document.createElement("span")
        termSelectorLabel.innerHTML = "<br>Select Current Grading Period: "
        parent.appendChild(termSelectorLabel)
    }

    let termSelector = document.createElement("select")
    termSelector.innerHTML = `
        <option value = "Quarter 1">Quarter 1</option>
        <option value = "Quarter 2">Quarter 2</option>
        <option value = "Quarter 3">Quarter 3</option>
        <option value = "Quarter 4">Quarter 4</option>`
    chrome.storage.local.get(["currentTerm"], (result) => {
        termSelector.value = result.currentTerm || "Quarter 1"
        selectedTerm = result.currentTerm || "Quarter 1"
    })
    parent.appendChild(termSelector)

    new Info(20, "Select the grading period for which you would like to tranfer grades", parent)

    termSelector.onchange = () => {
        selectedTerm = termSelector.value

        homeSection.termSelector.value = selectedTerm
        for (let i in courseSections) {
            courseSections[i].termSelector.value = selectedTerm
            courseSections[i].makeTypeMatchers()
        }

        chrome.storage.local.set({currentTerm: termSelector.value}).then(() => {
            console.log("current term saved")
        })
    }
    
    let termSelectorLineBreak = document.createElement("br")
    parent.appendChild(termSelectorLineBreak)

    return termSelector

}



class HomeSection extends Section {
    constructor() {
        super("Canvas To Synergy")


        this.sideBarLink = new SectionLink("Home", this)


        this.termSelector = createTermSelector(this.wrapper, true)

        this.coursesLoading = new Loading(35, this.wrapper)
        this.coursesLoading.startLoading()


        this.currentCoursesWrapper = document.createElement("span")
        this.wrapper.appendChild(this.currentCoursesWrapper)

        this.showOtherCoursesButton = document.createElement("button")
        this.showOtherCoursesButton.classList.add("c2sButton", "reloadButton")
        this.showOtherCoursesButton.style.margin = "5px"
        this.showOtherCoursesButton.style.display = "none"
        this.showOtherCoursesButton.textContent = "Show Other Courses"
        this.wrapper.appendChild(this.showOtherCoursesButton)

        this.wrapper.appendChild(document.createElement("br"))

        this.otherCoursesWrapper = document.createElement("span")
        this.otherCoursesWrapper.style.display = "none"
        this.wrapper.appendChild(this.otherCoursesWrapper)

        this.showOtherCoursesButton.onclick = () => {
            if (this.otherCoursesWrapper.style.display == "none") {
                this.otherCoursesWrapper.style.display = ""
                this.showOtherCoursesButton.textContent = "Hide Other Courses"
            }
            else {
                this.otherCoursesWrapper.style.display = "none"
                this.showOtherCoursesButton.textContent = "Show Other Courses"
            }
        }

    }

    populateCurrentCourses(courses) {

        this.currentCoursesWrapper.innerHTML = ""
        this.otherCoursesWrapper.innerHTML = ""

        if (this.coursesLoading.image != null) this.coursesLoading.image.remove()

        let addCourseListing = (course, parent) => {

            let alreadyAdded = false
            for (let j = 0; j < courseSections.length; j++) if (courseSections[j].id == course.id) alreadyAdded = true

            let text = "+ Add"
            let elementClass = "actionButton"

            if (alreadyAdded) {
                text = "Remove"
                elementClass = "removeButton"
            }

            let extraInfo = ""
            if (course.workflow_state == "available") extraInfo += ` <i style = "color: green">available</i>`
            else extraInfo += ` <i style = "color: darkgray">` + course.workflow_state + "</i>"
            if (course.end_at != null) {
                let endAtDate = new Date(course.end_at)
                if (endAtDate.getTime() <= endDates[1].getTime()) extraInfo += ` <i style = "color: gray">first semester</i>`
                else if (endAtDate.getTime() <= endDates[3].getTime()) extraInfo += ` <i style = "color: gray">second semester</i>`
            }


            let courseButton = document.createElement("button")
            courseButton.classList.add(elementClass, "c2sButton")
            courseButton.style.margin = "5px"
            courseButton.textContent = text
            parent.appendChild(courseButton)

            let courseLabel = document.createElement("span")
            courseLabel.innerHTML = `<a href = "https://lms.pps.net/courses/` + course.id + `" target = "_blank">` + course.name + "</a> (" + course.id + ")" + extraInfo + "<br>"
            parent.appendChild(courseLabel)

            courseButton.onclick = () => {
                if (courseButton.textContent == "+ Add") {
                    courseSections.push(new CourseSection({
                        name: course.name,
                        id: course.id
                    }))
                    
                    courseButton.classList.remove("actionButton")
                    courseButton.classList.add("removeButton")
                    courseButton.textContent = "Remove"
                }
                else {
                    for (let j in courseSections) if (courseSections[j].id == course.id) {
                        courseSections[j].sideBarLink.delete()
                        courseSections[j].delete()

                        courseSections.splice(courseSections.indexOf(courseSections[j]), 1)
                    }

                    courseButton.classList.remove("removeButton")
                    courseButton.classList.add("actionButton")
                    courseButton.textContent = "+ Add"
                }
                
                saveCourses()
            }
        }

        for (let i = 0; i < courses.length; i++) {

            let parent = this.otherCoursesWrapper
            if (courses[i].workflow_state == "available") parent = this.currentCoursesWrapper

            addCourseListing(courses[i], parent)

        }

        for (let i = 0; i < courseSections.length; i++) {
            let isAlreadyListed = false
            for (let j = 0; j < courses.length; j++) if (courses[j].id == courseSections[i].id) isAlreadyListed = true

            if (!isAlreadyListed) addCourseListing({
                id: courseSections[i].id,
                name: courseSections[i].name,
                workflow_state: ""
            }, this.currentCoursesWrapper)
        }

        if (this.otherCoursesWrapper.innerHTML != "") this.showOtherCoursesButton.style.display = ""
        else this.showOtherCoursesButton.style.display = "none"

    }


}


class SettingsSection extends Section {

    constructor() {
        super("Settings")
        
        this.sideBarLink = new SectionLink("Settings", this)
        

        let sampleFileLabel = document.createElement("span")
        sampleFileLabel.innerHTML = "<br>Upload New Synergy Sample File: "
        this.wrapper.appendChild(sampleFileLabel)

        this.massImportInput = document.createElement("input")
        this.massImportInput.type = "file"
        
        this.wrapper.appendChild(this.massImportInput)
        
        this.massImportInput.onchange = (event) => {
            let fileReader = new FileReader()
            fileReader.readAsBinaryString(event.target.files[0])
            fileReader.onload = () => {
                let massImport = XLSX.read(fileReader.result, {type: "binary"})
                let typeSheet = massImport.Sheets["Instructions"]
        
                types = []
                for (let row in typeSheet) if (row.indexOf("B") != -1) types.push(typeSheet[row].h)
                types.splice(0, 3)
                console.log("uploaded types", types)

                for (let i = 0; i < courseSections.length; i++) courseSections[i].makeTypeMatchers()
                this.makeOverallGradeTypeOptions()
        
                chrome.storage.local.set({types: JSON.stringify(types)}, () => {
                    console.log("types saved")
                })
            }
        }

        
        let preferencesTitle = document.createElement("h3")
        preferencesTitle.style.marginTop = "20px"
        preferencesTitle.style.marginRight = "20px"
        preferencesTitle.style.paddingBottom = "10px"
        preferencesTitle.style.borderBottomStyle = "dashed"
        preferencesTitle.style.borderColor = "gray"
        preferencesTitle.textContent = "Preferences"
        this.wrapper.appendChild(preferencesTitle)

        this.preferences = {
            showPreviewExports: false,
            transferOverallGrades: false
        }
        
        let showPreviewExportsToggle = document.createElement("input")
        showPreviewExportsToggle.type = "checkbox"
        showPreviewExportsToggle.style.margin = "15px 15px 20px 10px"
        showPreviewExportsToggle.checked = this.sows
        this.wrapper.appendChild(showPreviewExportsToggle)

        let showPreviewExportsLabel = document.createElement("span")
        showPreviewExportsLabel.style.height = "20px"
        showPreviewExportsLabel.innerHTML = "Show Preview Transfer Files<br>"
        this.wrapper.appendChild(showPreviewExportsLabel)

        showPreviewExportsToggle.onchange = () => {
            this.preferences.showPreviewExports = showPreviewExportsToggle.checked
            this.savePreferences()
            for (let i in courseSections) courseSections[i].makeTypeMatchers()
        }

        let transferOverallGradesToggle = document.createElement("input")
        transferOverallGradesToggle.type = "checkbox"
        transferOverallGradesToggle.style.margin = "15px 15px 20px 10px"
        transferOverallGradesToggle.checked = this.sows
        this.wrapper.appendChild(transferOverallGradesToggle)

        let transferOverallGradesLabel = document.createElement("span")
        transferOverallGradesLabel.style.height = "20px"
        transferOverallGradesLabel.innerHTML = "Transfer Overall Grades<br>"
        this.wrapper.appendChild(transferOverallGradesLabel)

        let transferOverallGradesBlurb = document.createElement("i")
        transferOverallGradesBlurb.style.color = "gray"
        transferOverallGradesBlurb.style.display = "none"
        transferOverallGradesBlurb.textContent = `Select an assignment type for the overall grade assignment`
        this.wrapper.appendChild(transferOverallGradesBlurb)

        this.overallTypeDropdown = document.createElement("select")
        this.overallTypeDropdown.style.display = "none"
        this.overallTypeDropdown.title = "Select the appropriate Synergy assignment type for the assignment group to the left"
        this.wrapper.appendChild(this.overallTypeDropdown)

        this.overallTypeDropdown.onchange = () => {
            overallGradeAssignmentType = this.overallTypeDropdown.value
            for (let i in courseSections) courseSections[i].makeTypeMatchers()
            chrome.storage.local.set({overallGradeAssignmentType: overallGradeAssignmentType}, () => {
                console.log("overall grade assignment type saved")
            })
        }


        transferOverallGradesToggle.onchange = () => {
            this.preferences.transferOverallGrades = transferOverallGradesToggle.checked
            this.savePreferences()
            if (this.preferences.transferOverallGrades) {
                transferOverallGradesBlurb.style.display = "block"
                this.overallTypeDropdown.style.display = "block"
            }
            else {
                transferOverallGradesBlurb.style.display = "none"
                this.overallTypeDropdown.style.display = "none"
            }
            for (let i in courseSections) {
                courseSections[i].fetched = false
                courseSections[i].makeTypeMatchers()
            }
            
        }
        
        chrome.storage.local.get(["preferences"], (result) => {

            if (result.preferences != null) this.preferences = JSON.parse(result.preferences)

            showPreviewExportsToggle.checked = this.preferences.showPreviewExports
            transferOverallGradesToggle.checked = this.preferences.transferOverallGrades
            if (this.preferences.transferOverallGrades) {
                transferOverallGradesBlurb.style.display = "block"
                this.overallTypeDropdown.style.display = "block"
            }
        })


        let accessTokenLabel = document.createElement("span")
        accessTokenLabel.innerHTML = "<br>Access Token (optional): "
        this.wrapper.appendChild(accessTokenLabel)

        this.accessTokenInput = document.createElement("input")
        this.accessTokenInput.type = "text"
        this.accessTokenInput.name = "accessTokenInput"
        this.accessTokenInput.value = accessToken || ""
        
        this.wrapper.appendChild(this.accessTokenInput)


        this.accessTokenSave = document.createElement("button")
        this.accessTokenSave.classList.add("actionButton", "c2sButton")
        this.accessTokenSave.style.marginLeft = "10px"
        this.accessTokenSave.textContent = "Save"
        this.wrapper.appendChild(this.accessTokenSave)

        this.accessTokenSave.onclick = () => {
            accessToken = this.accessTokenInput.value
            if (accessToken == null) accessToken = ""
            getCoursesAsync()
        }

        this.accessTokenSave.click()



        this.fileLineBreak = document.createElement("br")
        this.wrapper.appendChild(this.fileLineBreak)


        
        this.getRawDataLabel = document.createElement("h3")
        this.getRawDataLabel.textContent = "Fetch Raw Data"
        this.wrapper.appendChild(this.getRawDataLabel)


        this.getRawDataInput = document.createElement("input")
        this.getRawDataInput.type = "text"
        this.wrapper.appendChild(this.getRawDataInput)

        this.getButton = document.createElement("button")
        this.getButton.classList.add("actionButton", "c2sButton")
        this.getButton.style.marginLeft = "10px"
        this.getButton.textContent = "GET"
        this.wrapper.appendChild(this.getButton)

        this.getLoading = new Loading(27.5, this.wrapper)

        this.rawDataText = document.createElement("code")
        this.rawDataText.style.backgroundColor = "transparent"
        this.rawDataText.style.borderStyle = "none"
        this.rawDataText.style.color = "rgb(50, 0, 0)"
        this.rawDataText.innerHTML = "<br>"
        this.wrapper.appendChild(this.rawDataText)

        this.getButton.onclick = async () => {
            this.getLoading.startLoading()
            try {
                let data = await getDataAsync([this.getRawDataInput.value], accessToken)
                let rawData = "<br>" + JSON.stringify(data, null, "\t")
                for (let i = rawData.length - 1; i >= 0 ; i--) if (rawData[i] == "\n") rawData = rawData.slice(0, i) + "<br>" + rawData.slice(i)
                for (let i = rawData.length - 1; i >= 0 ; i--) if (rawData[i] == "\t") rawData = rawData.slice(0, i) + "&emsp;" + rawData.slice(i)

                this.rawDataText.innerHTML = rawData

                this.getLoading.endAnimation(this.getLoading)
            }
            catch {
                this.rawDataText.innerHTML = "<br>failed to retrieve :("

                this.getLoading.endAnimation(this.getLoading)
            }
        }
    }

    savePreferences() {
        
        chrome.storage.local.set({preferences: JSON.stringify(this.preferences)}, () => {
            console.log("preferences saved")
        })
    }

    makeOverallGradeTypeOptions() {
        this.overallTypeDropdown.innerHTML = ""
        for (let j = 0; j < types.length; j++) {
            let typeDropdownOption = document.createElement("option")
            typeDropdownOption.value = types[j]
            typeDropdownOption.textContent = types[j]
            this.overallTypeDropdown.appendChild(typeDropdownOption)
        }
    }

    
}


class HelpSection extends Section {
    constructor() {
        super("Help")

        this.sideBarLink = new SectionLink("Help", this)
        

        this.instructionsBody = document.createElement("p")
        this.instructionsBody.innerHTML = `
        <i style = "color: green;"><b>First Time Setup</b></i><i style = "color: gray"> (Synergy Sample File)</i>
        <ul class = "instructions">
            <li>In TeacherVUE, go to the <b>Import Assignments</b> page under the <b>Grade Book</b> dropdown menu</li>
            <li>Click on the <b>Download Sample File</b> button in the top right of the page</li>
            <li>Upload this file to Canvas To Synergy in the <b>Settings</b> page</li>
        </ul>
        <i style = "color: green;"><b>Adding Courses</b></i>
        <ul class = "instructions">
            <li>In the Canvas To Synergy <b>Home</b> page, click <b>+ Add</b> next to courses that you would like to use with Canvas To Synergy</li>
        </ul>
        <i style = "color: green;"><b>Removing Courses</b></i>
        <ul class = "instructions">
            <li>In a Canvas To Synergy course page, click <b>Remove This Course</b></li>
            <ul class = "instructions">
                <li><i style = "color: gray">This only affects your Canvas To Synergy preferences, Canvas To Synergy cannot delete your actual courses</i></li>
            </ul>
        </ul>
        <i style = "color: green;"><b>Configuring Export Settings</b></i><i style = "color: gray"> (per course)</i>
        <ul class = "instructions">
            <li>Select the Synergy assignment types from the dropdowns that match the Canvas assignment groups on the left (for assignment weighting)</li>
            <li>If you'd like ungraded submissions to be hidden in Synergy, check the <b>Show Only When Scored</b> checkbox</li>
            <li>If you'd like to exclude any students from the grade transfer, select their names in the selection box with <b><i>Ctrl + click</i></b></li>
        </ul>
        <i style = "color: green;"><b>Downloading Synergy Import Files</b></i><i style = "color: gray"> (per course section)</i>
        <ul class = "instructions">
            <li>In a Canvas To Synergy course page, click on the <i class="icon-download" aria-hidden="true"></i> button corresponding with the section you would like to transfer grades for</li>
            <ul class = "instructions">
                <li>If your gradebook has changed while using Canvas to Synergy click <b>Refresh</b> to make sure the transfer files are up-to-date</li>
            </ul>
        </ul>
        <i style = "color: green;"><b>Importing grades to Synergy</b></i><i style = "color: gray"> (per course section)</i>
        <ul class = "instructions">
            <li>Go to <b>Import Assignments</b> under the <b>Grade Book</b> dropdown menu in TeacherVUE</li>
            <li>Make sure you are in the desired course section</li>
            <li>Turn on the first and third settings</li>
            <li>Select or drag and drop the corresponding Canvas To Synergy file into the file selector</li>
            <li>If errors appear, consult the <i style = "color: darkred;">Possible Causes For Error</i> section below</li>
            <li>Review the uploaded grades if you'd like, and click <b>Import Data</b></li>
            <li>Check gradebook to make sure grades were imported correctly</li>
            <li>Follow the image below to make sure all assignments are applied to the current grading period
        <br><br><img src = "https://i.imgur.com/ywhifaO.png" style = "border-radius: 5px"></img></li><br>
        </ul>
        <i style = "color: darkred;"><b>Possible Causes For Error</b></i><i style = "color: gray"> (errors are common -- no need to worry)</i>
        <ul class = "instructions">
            <li>Make sure you are uploading to the correct course and period number that corresponds with the Canvas To Synergy file name</li>
            <li>Make sure there are no extra students in your Canvas course section that are absent from your Synergy course</li>
            <ul class = "instructions">
                <li>If this is the case, try turning on <b>Show Only When Scored</b> in the Canvas To Synergy course page, re-download the file, and try again</li>
            </ul>
            <li><span style = "color: darkred;">If the solutions above don't work:</span></li>
            <ul class = "instructions">
                <li>Turn on the fourth setting in <b>Import Assignments</b> to show detailed error messages and re-upload the file</li>
                <li>Email nfenger@pps.net or sunil.williams.4@gmail.com with your error message</li>
        </ul>
        <br>
        <br>
        <br>
        
        `

        this.wrapper.appendChild(this.instructionsBody)


    }


}


class CourseSection extends Section {
    constructor(courseInfo) {
        super(courseInfo.name)

        this.id = courseInfo.id
        this.name = courseInfo.name
        this.sections = []
        this.assignments = []
        this.grades = []
        this.overallStudentGrades = []
        this.assignmentGroups = []
        this.typeSelections = courseInfo.typeSelections || {}
        this.sows = courseInfo.sows || false
        this.studentsToIgnore = courseInfo.studentsToIgnore || []

        this.fetched = false



        this.sideBarLink = new SectionLink(this.name, this)
        
        this.refreshGradesButton = document.createElement("button")
        this.refreshGradesButton.classList.add("reloadButton", "c2sButton")
        this.refreshGradesButton.textContent = "Refresh"
        this.titleWrapper.appendChild(this.refreshGradesButton)

        this.refreshGradesButton.onclick = () => {

            this.fetchGrades()
        }

        this.loadingBar = new LoadingBar(this.wrapper)
        this.loadingBar.wrapper.style.display = "none"

        this.termSelectorWrapper = document.createElement("div")
        this.termSelector = createTermSelector(this.termSelectorWrapper, false)



        this.courseElements = []
        this.infos = []

        this.makeTypeMatchers()
        
    }



    makeTypeMatchers() {
        

        for (let i in this.courseElements) this.courseElements[i].remove()
        for (let i in this.infos) this.infos[i].wrapper.remove()

        this.courseElements = []
        this.infos = []

        if (!settingsSection.preferences.transferOverallGrades && (this.assignmentGroups.length == 0 || this.assignments.length == 0 || this.sections.length == 0 || this.grades.length == 0)) {
            return
        }
        if (settingsSection.preferences.transferOverallGrades && (this.sections.length == 0 || this.overallStudentGrades.length == 0)) {
            return
        }

        this.loadingBar.wrapper.style.display = "none"
        this.loadingBar.updateStatus(0)

        let downloadTitle = document.createElement("h3")
        downloadTitle.style.marginTop = "20px"
        downloadTitle.style.marginRight = "20px"
        downloadTitle.style.paddingBottom = "10px"
        downloadTitle.style.borderBottomStyle = "dashed"
        downloadTitle.style.borderColor = "gray"
        downloadTitle.textContent = "Download Transfer Files"
        this.wrapper.appendChild(downloadTitle)
        this.courseElements.push(downloadTitle)

        this.wrapper.appendChild(this.termSelectorWrapper)
        this.courseElements.push(this.termSelectorWrapper)

        if (this.sections.length > 0) this.infos.push(new Info(20, "Click buttons below to download grade transfer files for each course section", downloadTitle))

        for (let i = 0; i < this.sections.length; i++) { // create a button for each canvas course section

            let downloadFileButton = document.createElement("button")
            downloadFileButton.classList.add("actionButton", "c2sButton")
            downloadFileButton.style.marginTop = "10px"
            downloadFileButton.innerHTML = `<i class="icon-download" aria-hidden="true"></i>` + " " + this.sections[i].name + " - " + selectedTerm
            downloadFileButton.title = "Download Synergy import file"
            this.wrapper.appendChild(downloadFileButton)
            this.courseElements.push(downloadFileButton)

            let lineBreak = document.createElement("br")
            this.wrapper.appendChild(lineBreak)
            this.courseElements.push(lineBreak)

            downloadFileButton.onclick = () => { 
                if (types.length != 0) { // download synergy import file (a .xls file with grades for this section)
                    this.convertGrades()
                    saveCourses()
                    console.log(this.sections[i].name, this.convertedGrades[this.sections[i].name])

                    // make .xls file from grades of this section

                    let currentGradesJSON = this.convertedGrades[this.sections[i].name]

                    let tableXML = `<thead valign = "top">`
                    tableXML += "<tr>"
                    for (let columnName in currentGradesJSON[0]) tableXML += "<th>" + columnName + "</th>"
                    tableXML += "</tr></thead><tbody>"

                    for (let i = 0; i < currentGradesJSON.length; i++) {
                        tableXML += "<tr>"
                        for (let columnName in currentGradesJSON[i]) {
                            tableXML += "<td>" + currentGradesJSON[i][columnName] + "</td>"
                        }
                        tableXML += "</tr>"
                    }

                    tableXML += "</tbody>"

                    tableXML = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--><meta http-equiv="content-type" content="text/plain; charset=UTF-8"/></head><body><table>${tableXML}</table></body></html>`

                    let gradesBlob = new Blob([tableXML], {type: "application/vnd.ms-excel"}) // create blob out of tableXML
                    // download the file as "canvas section name.xls"
                    let url = URL.createObjectURL(gradesBlob)
                    let a = document.createElement("a")
                    document.body.appendChild(a)
                    a.href = url
                    a.download = this.sections[i].name + " - " + selectedTerm + ".xls"
                    a.click()
                    window.setTimeout(() => {URL.revokeObjectURL(url)}, 0)
                }
                else {
                    alert("You must upload a Synergy Sample File before downloading (see help page on the left)")
                }
            }
        }

        let exportSettingsTitle = document.createElement("h3")
        exportSettingsTitle.style.marginTop = "20px"
        exportSettingsTitle.style.marginRight = "20px"
        exportSettingsTitle.style.paddingBottom = "10px"
        exportSettingsTitle.style.borderBottomStyle = "dashed"
        exportSettingsTitle.style.borderColor = "gray"
        exportSettingsTitle.textContent = "Transfer Settings"
        this.wrapper.appendChild(exportSettingsTitle)
        this.courseElements.push(exportSettingsTitle)

        let infoText = `
        Match your Canvas weighting categories to your Synergy weighting categories<br><br>
        Select whether or not you would like unscored assignments to show up in your students' gradebooks<br><br>
        Select students to exclude from the transfer`
        if (settingsSection.preferences.transferOverallGrades) infoText = "Select students to exclude from the transfer"
        this.infos.push(new Info(20, infoText, exportSettingsTitle))

        if (!settingsSection.preferences.transferOverallGrades) {

            if (types.length > 0) {
                let typeSelectorWrapper = document.createElement("div")
                typeSelectorWrapper.style = `
                    margin-top: 15px;
                    width: 520px;`
                this.wrapper.appendChild(typeSelectorWrapper)
                this.courseElements.push(typeSelectorWrapper)

                let groupsTitle = document.createElement("i")
                groupsTitle.style.float = "left"
                groupsTitle.style.color = "gray"
                groupsTitle.textContent = "Assignment Group (Canvas)"
                typeSelectorWrapper.appendChild(groupsTitle)

                let typesTitle = document.createElement("i")
                typesTitle.style.float = "right"
                typesTitle.style.color = "gray"
                typesTitle.textContent = "Assignment Type (Synergy)"
                typeSelectorWrapper.appendChild(typesTitle)

                typeSelectorWrapper.innerHTML += "<br>"

                for (let i = 0; i < this.assignmentGroups.length; i++) {

                    let typeMatcher = document.createElement("div")
                    
                    typeMatcher.style = `
                        margin-top: 10px;
                        padding-top: 10px;
                        border-top-style: dotted;
                        border-color: darkgray;`
                    typeSelectorWrapper.appendChild(typeMatcher)
                    this.courseElements.push(typeMatcher)

                    
                    let typeDropdownWrapper = document.createElement("div")
                    typeDropdownWrapper.style.float = "right"
                    typeMatcher.appendChild(typeDropdownWrapper)

                    let typeDropdown = document.createElement("select")
                    typeDropdown.title = "Select the appropriate Synergy assignment type for the assignment group to the left"
                    typeDropdownWrapper.appendChild(typeDropdown)

                    for (let j = 0; j < types.length; j++) {
                        let typeDropdownOption = document.createElement("option")
                        typeDropdownOption.value = types[j]
                        typeDropdownOption.textContent = types[j]
                        typeDropdown.appendChild(typeDropdownOption)
                    }

                    if (Object.keys(this.typeSelections).length > 0) typeDropdown.value = this.typeSelections[this.assignmentGroups[i].name]
                    this.typeSelections[this.assignmentGroups[i].name] = typeDropdown.value
                    typeDropdown.onchange = () => {
                        this.typeSelections[this.assignmentGroups[i].name] = typeDropdown.value
                        this.convertGrades()
                        this.makeTypeMatchers()
                        saveCourses()
                    }

                    let groupLabel = document.createElement("div")
                    groupLabel.style = `
                        padding: 7.5px 7.5px 7.5px 10px;
                        width: 200px;
                        background-color: green;
                        color: white;
                        border-radius: 3px;`
                    groupLabel.textContent = this.assignmentGroups[i].name
                    let groupLabelTitle = ""
                    for (let j = 0; j < this.assignments.length; j++) if (this.assignments[j].assignment_group_id == this.assignmentGroups[i].id) groupLabelTitle += this.assignments[j].name + ", "
                    groupLabelTitle = groupLabelTitle.slice(0, -2)
                    groupLabel.title = groupLabelTitle

                    typeMatcher.appendChild(groupLabel)

                    

                }
            } else {

                let sampleFileLabel = document.createElement("span")
                sampleFileLabel.innerHTML = "<br>Upload A Synergy Sample File: "
                this.wrapper.appendChild(sampleFileLabel)
                this.courseElements.push(sampleFileLabel)

                let massImportInput = document.createElement("input")
                massImportInput.type = "file"
                
                this.wrapper.appendChild(massImportInput)
                this.courseElements.push(massImportInput)

                this.infos.push(new Info(20, "In order to match assignment weighting groups, you must first upload a Synergy sample file (see help page for instructions)", this.wrapper))

                let lineBreak = document.createElement("br")
                this.wrapper.appendChild(lineBreak)
                this.courseElements.push(lineBreak)
                
                massImportInput.onchange = (event) => {
                    let fileReader = new FileReader()
                    fileReader.readAsBinaryString(event.target.files[0])
                    fileReader.onload = () => {
                        let massImport = XLSX.read(fileReader.result, {type: "binary"})
                        let typeSheet = massImport.Sheets["Instructions"]
                
                        types = []
                        for (let row in typeSheet) if (row.indexOf("B") != -1) types.push(typeSheet[row].h)
                        types.splice(0, 3)
                        console.log("uploaded types", types)

                        for (let i = 0; i < courseSections.length; i++) courseSections[i].makeTypeMatchers()
                        settingsSection.makeOverallGradeTypeOptions()
                
                        chrome.storage.local.set({types: JSON.stringify(types)}, () => {
                            console.log("types saved")
                        })
                    }
                }
            }

            let preferencesWrapper = document.createElement("div")
            preferencesWrapper.style.width = "520px"
            preferencesWrapper.style.marginTop = "10px"
            preferencesWrapper.style.borderTopStyle = "dotted"
            preferencesWrapper.style.borderTopColor = "darkgray"
            this.wrapper.appendChild(preferencesWrapper)
            this.courseElements.push(preferencesWrapper)


            let sowsCheckbox = document.createElement("input")
            sowsCheckbox.type = "checkbox"
            sowsCheckbox.style.margin = "15px 15px 20px 10px"
            sowsCheckbox.checked = this.sows
            preferencesWrapper.appendChild(sowsCheckbox)

            let sowsLabel = document.createElement("span")
            sowsLabel.innerHTML = "Show Only When Scored<br>"
            preferencesWrapper.appendChild(sowsLabel)

            sowsCheckbox.onclick = () => {
                this.sows = sowsCheckbox.checked
                this.convertGrades()
                this.makeTypeMatchers()
                saveCourses()
            }
            
        }

        let ignoreStudentsListWrapper = document.createElement("div")
        ignoreStudentsListWrapper.style.marginBottom = "10px"
        this.wrapper.appendChild(ignoreStudentsListWrapper)
        this.courseElements.push(ignoreStudentsListWrapper)
        
        let ignoreStudentsTitle = document.createElement("i")
        ignoreStudentsTitle.style.color = "gray"
        ignoreStudentsTitle.style.marginBottom = "10px"
        ignoreStudentsTitle.style.paddingBottom = "10px"
        ignoreStudentsTitle.style.borderBottomStyle = "dotted"
        ignoreStudentsTitle.style.borderBottomColor = "darkgray"
        ignoreStudentsTitle.textContent = "Select Students To Be Excluded From Export (Ctrl + click)"
        ignoreStudentsListWrapper.appendChild(ignoreStudentsTitle)

        ignoreStudentsListWrapper.appendChild(document.createElement("br"))


        let ignoreStudentsList = document.createElement("select")
        ignoreStudentsList.classList.add("ignoreStudentsList")
        ignoreStudentsList.style.height = "150px"
        ignoreStudentsList.style.marginTop = "20px"
        ignoreStudentsList.multiple = true
        ignoreStudentsListWrapper.appendChild(ignoreStudentsList)

        for (let i = 0; i < this.sections.length; i++) {
            if (this.sections[i].students != null) for (let j = 0; j < this.sections[i].students.length; j++) {
                let option = document.createElement("option")
                option.value = this.sections[i].students[j].sis_user_id
                option.textContent = this.sections[i].students[j].sortable_name
                
                for (let k = 0; k < this.studentsToIgnore.length; k++) if (this.sections[i].students[j].sis_user_id == this.studentsToIgnore[k]) option.selected = true

                ignoreStudentsList.appendChild(option)
            }
        }

        ignoreStudentsListWrapper.appendChild(document.createElement("br"))

        let clearSelectionButton = document.createElement("button")
        clearSelectionButton.classList.add("c2sButton", "actionButton")
        clearSelectionButton.style.padding = "5px 8px 5px 8px"
        clearSelectionButton.textContent = "Clear Selection"
        ignoreStudentsListWrapper.appendChild(clearSelectionButton)

        let updateStudentsToIgnore = () => {
            this.studentsToIgnore = []
            for (let i in ignoreStudentsList.options) {
                if (ignoreStudentsList.options[i].selected) this.studentsToIgnore.push(ignoreStudentsList.options[i].value)
            }
            this.convertGrades()
            this.makeTypeMatchers()
            saveCourses()
        }

        clearSelectionButton.onclick = () => {
            for (let i in ignoreStudentsList.options) {
                try {ignoreStudentsList.options[i].selected = false}
                catch {}
            }
            updateStudentsToIgnore()
        }

        ignoreStudentsList.onchange = updateStudentsToIgnore


        if (settingsSection.preferences.showPreviewExports) {
            
            let gradesPreviewTitle = document.createElement("h3")
            gradesPreviewTitle.style.marginTop = "20px"
            gradesPreviewTitle.style.marginRight = "20px"
            gradesPreviewTitle.style.paddingBottom = "10px"
            gradesPreviewTitle.style.borderBottomStyle = "dashed"
            gradesPreviewTitle.style.borderColor = "gray"
            gradesPreviewTitle.textContent = "Preview Transfer Files"
            this.wrapper.appendChild(gradesPreviewTitle)
            this.courseElements.push(gradesPreviewTitle)


            for (let section in this.convertedGrades) {
                let sectionTitle = document.createElement("h4")
                sectionTitle.style.marginTop = "15px"
                sectionTitle.textContent = section
                this.wrapper.appendChild(sectionTitle)
                this.courseElements.push(sectionTitle)

                let gradesPreviewTableWrapper = document.createElement("div")
                gradesPreviewTableWrapper.style.width = "1150px"
                gradesPreviewTableWrapper.style.overflowY = "auto"
                gradesPreviewTableWrapper.style.display = "none"
                this.wrapper.appendChild(gradesPreviewTableWrapper)
                this.courseElements.push(gradesPreviewTableWrapper)

                let showTableButton = document.createElement("button")
                showTableButton.classList.add("c2sButton", "actionButton")
                showTableButton.style.marginLeft = "10px"
                showTableButton.style.padding = "5px 8px 5px 8px"
                showTableButton.textContent = "Show"
                sectionTitle.appendChild(showTableButton)
                showTableButton.onclick = () => {
                    if (gradesPreviewTableWrapper.style.display == "none") {
                        gradesPreviewTableWrapper.style.display = "block"
                        showTableButton.textContent = "Hide"

                        gradesPreviewTableWrapper.scrollIntoView({behavior: "smooth"})
                    }
                    else {
                        gradesPreviewTableWrapper.style.display = "none"
                        showTableButton.textContent = "Show"
                    }
                }

                let currentGradesJSON = this.convertedGrades[section]
                
                let tableXML = `<thead valign = "top" style = "background-color: var(--ic-brand-button--primary-bgd); color: white;">`
                tableXML += "<tr>"
                for (let columnName in currentGradesJSON[0]) if (
                    columnName == "STUDENT_LAST_NAME" || 
                    columnName == "STUDENT_FIRST_NAME" || 
                    columnName == "ASSIGNMENT_NAME" || 
                    columnName == "OVERALL_SCORE" ||
                    columnName == "MAX_SCORE" ||
                    columnName == "ASSIGNMENT_TYPE" ||
                    columnName == "EXCUSED"
                ) tableXML += `<th style = "border: 1px solid var(--ic-brand-button--primary-bgd);">` + columnName + "</th>"
                tableXML += "</tr></thead><tbody>"

                for (let i = 0; i < currentGradesJSON.length; i++) {
                    tableXML += "<tr>"
                    for (let columnName in currentGradesJSON[i]) {
                        if (
                            columnName == "STUDENT_LAST_NAME" || 
                            columnName == "STUDENT_FIRST_NAME" || 
                            columnName == "OVERALL_SCORE" ||
                            columnName == "MAX_SCORE" ||
                            columnName == "ASSIGNMENT_TYPE" ||
                            columnName == "EXCUSED"
                        ) tableXML += `<td style = "border: 1px dashed darkgray;">` + currentGradesJSON[i][columnName] + "</td>"

                        else if (columnName == "ASSIGNMENT_NAME") {
                            if (!settingsSection.preferences.transferOverallGrades) tableXML += `<td style = "border: 1px dashed darkgray;"><a href = "${currentGradesJSON[i]["ASSIGNMENT_DESCRIPTION"].slice(12)}" target = "_blank">${currentGradesJSON[i][columnName]}</a></td>`
                            else tableXML += `<td style = "border: 1px dashed darkgray;">${currentGradesJSON[i][columnName]}</td>`
                        }
                    }
                    tableXML += "</tr>"
                }

                tableXML += "</tbody>"

                let sectionTable = document.createElement("table")
                sectionTable.style.width = "1150px"
                sectionTable.style.borderSpacing = "5px"
                sectionTable.style.fontSize = "15px"
                sectionTable.innerHTML = tableXML
                gradesPreviewTableWrapper.appendChild(sectionTable)
                this.courseElements.push(sectionTable)
                

            }


        }



    }


    fetchGrades() {
    
        this.fetched = true
        this.refreshGradesButton.style.display = "none"

        this.loadingBar.wrapper.style.display = "block"
        this.loadedValue = 0

        this.assignmentGroups = []
        this.assignments = []
        this.sections = []
        this.grades = []

        this.makeTypeMatchers()
        if (!settingsSection.preferences.transferOverallGrades) {
            
            getDataAsync(["courses", this.id, "sections", "?include[]=students"], accessToken).then((sections) => {
                this.sections = sections
                console.log("sections", sections)

                this.loadedValue += .1
                this.loadingBar.updateStatus(this.loadedValue)
                
                this.convertGrades()
                this.makeTypeMatchers()
                saveCourses()
            })

            getDataAsync(["courses", this.id, "assignments", "?include[]=all_dates"], accessToken).then((assignments) => {
                console.log("assignments", assignments)
                for (let i = assignments.length - 1; i >= 0; i--) if (!assignments[i].graded_submissions_exist) assignments.splice(i, 1)
                let optimizedAssignments = []
                for (let i = 0; i < assignments.length; i++) {
                    optimizedAssignments.push({
                        assignment_group_id: assignments[i].assignment_group_id,
                        all_dates: assignments[i].all_dates,
                        created_at: assignments[i].created_at,
                        name: assignments[i].name,
                        html_url: assignments[i].html_url,
                        points_possible: assignments[i].points_possible
                    })
                }
                this.assignments = optimizedAssignments
                console.log("optimized assignments", optimizedAssignments)
                this.loadedValue += .1
                this.loadingBar.updateStatus(this.loadedValue)

                if (assignments.length == 0) {
                    
                    this.loadedValue = 1
                    this.loadingBar.updateStatus(this.loadedValue)
                    
                    this.grades = []
                    console.log("no graded assignments exist")

                    this.convertGrades()
                    this.makeTypeMatchers()
                    saveCourses()

                    this.refreshGradesButton.style.display = ""

                }

                var assignmentScores = []
                for (let i = 0; i < assignments.length; i++) {
                    window.setTimeout(() => {
                        getDataAsync(["courses", this.id, "assignments", assignments[i].id, "submissions"], accessToken).then((scores) => {
                            assignmentScores[i] = scores
                            this.loadedValue += .7 / assignments.length
                            this.loadingBar.updateStatus(this.loadedValue)

            
                            let doneLoadingGrades = true
                            for (let j = 0; j < assignments.length; j++) if (assignmentScores[j] == null) doneLoadingGrades = false
                            if (doneLoadingGrades) {
                                
                                
                                let optimizedGrades = []
                                for (let k = 0; k < assignmentScores.length; k++) {
                                    optimizedGrades.push([])
                                    for (let l = 0; l < assignmentScores[k].length; l++) {
                                        optimizedGrades[k].push({
                                            user_id: assignmentScores[k][l].user_id,
                                            score: assignmentScores[k][l].score,
                                            excused: assignmentScores[k][l].excused
                                        })
                                    }
                                }

                                this.grades = optimizedGrades
                                console.log("assignment scores", assignmentScores)

                                this.convertGrades()
                                this.makeTypeMatchers()
                                saveCourses()

                                this.refreshGradesButton.style.display = ""

                            }
                        })
                    }, i * 150)
                }
                
            })

            getDataAsync(["courses", this.id, "assignment_groups"], accessToken).then((assignmentGroups) => {
                this.assignmentGroups = assignmentGroups
                console.log("assignment groups", assignmentGroups)

                this.loadedValue += .1
                this.loadingBar.updateStatus(this.loadedValue)

                this.makeTypeMatchers()
            })
        } else {
            
            this.overallStudentGrades = []
            getDataAsync(["courses", this.id, "sections", "?include[]=students"], accessToken).then((sections) => {
                this.sections = sections
                console.log("sections", sections)

                this.loadedValue += .1
                this.loadingBar.updateStatus(this.loadedValue)
                
                this.convertGrades()
                this.makeTypeMatchers()
                saveCourses()

                // get enrollments for each section
                let enrollmentsBySection = []
                for (let i = 0; i < this.sections.length; i++) {
                    getDataAsync(["sections", this.sections[i].id, "enrollments"], accessToken).then((enrollments) => {
                        console.log("enrollments for " + this.sections[i].name, enrollments)

                        enrollmentsBySection[i] = enrollments
                        this.loadedValue += .8 / this.sections.length
                        this.loadingBar.updateStatus(this.loadedValue)

                        let doneLoadingEnrollments = true
                        for (let j = 0; j < this.sections.length; j++) if (enrollmentsBySection[j] == null) doneLoadingEnrollments = false
                        if (doneLoadingEnrollments) {
                            
                            this.overallStudentGrades = []
                            for (let j = 0; j < this.sections.length; j++) {
                                for (let k = 0; k < enrollmentsBySection[j].length; k++) {
                                    if (enrollmentsBySection[j][k].type == "StudentEnrollment" && enrollmentsBySection[j][k].grades.current_score != undefined) {
                                        this.overallStudentGrades.push({
                                            sis_user_id: enrollmentsBySection[j][k].sis_user_id,
                                            sortable_name: enrollmentsBySection[j][k].user.sortable_name,
                                            score: enrollmentsBySection[j][k].grades.current_score
                                        })
                                    }
                                }
                            }

                            console.log("overall student grades", this.overallStudentGrades)

                            this.convertGrades()
                            this.makeTypeMatchers()
                            saveCourses()

                            this.refreshGradesButton.style.display = ""

                        }
                    })
                }
            })

            getDataAsync(["courses", this.id, "assignment_groups"], accessToken).then((assignmentGroups) => {
                this.assignmentGroups = assignmentGroups
                console.log("assignment groups", assignmentGroups)

                this.loadedValue += .1
                this.loadingBar.updateStatus(this.loadedValue)

                this.makeTypeMatchers()
            })
        }
    }



    convertGrades() {
        // if any data is missing, return
        if (this.sections == null || this.sections == [] || this.assignments == null || this.assignments == [] || this.grades == null || this.grades == [] || this.assignmentGroups == null || this.assignmentGroups == []) return

        // turn imported data into a JSON
        let exportJSON = {}
        for (let i = 0; i < this.sections.length; i++) {
            let currentSection = this.sections[i].name
            exportJSON[currentSection] = []
            
            if (this.sections[i].students != null) for (let j = 0; j < this.sections[i].students.length; j++) {
                let currentStudent = this.sections[i].students[j]
                
                let ignore = false
                for (let m = 0; m < this.studentsToIgnore.length; m++) if (Number(currentStudent.sis_user_id) == this.studentsToIgnore[m]) ignore = true
                if (ignore) continue

                if (!settingsSection.preferences.transferOverallGrades) {
                        
                    for (let k = 0; k < this.grades.length; k++) if (this.assignments[k] != null) {
                        let currentAssignmentType
                        for (let l = 0; l < this.assignmentGroups.length; l++) if (this.assignments[k].assignment_group_id == this.assignmentGroups[l].id) currentAssignmentType = this.typeSelections[this.assignmentGroups[l].name]
                        let submissionFound = false
                        let currentScore = null
                        let currentExcused = false
                        for (let l = 0; l < this.grades[k].length; l++) {
                            if (this.grades[k][l].user_id == currentStudent.id) {
                                submissionFound = true
                                currentScore = this.grades[k][l].score
                                currentExcused = this.grades[k][l].excused
                            }
                        }
                        if (currentExcused == true) currentExcused = "True"
                        else currentExcused = "False"

                        let currentDate = this.assignments[k].all_dates[0]
                        for (let l = 0; l < this.assignments[k].all_dates.length; l++) {
                            if (this.assignments[k].all_dates[l].title == currentSection) {
                                currentDate = this.assignments[k].all_dates[l]
                            }
                        }

                        let assignmentDate = filterDate(new Date(this.assignments[k].created_at))
                        let dueDate = filterDate(new Date(currentDate.due_at))

                        // add object to exportJSON containing grade on current assignment for current student
                        if (submissionFound) exportJSON[currentSection].push({
                            "STUDENT_PERM_ID": currentStudent.sis_user_id,
                            "STUDENT_LAST_NAME": currentStudent.sortable_name.slice(0, currentStudent.sortable_name.indexOf(", ")),
                            "STUDENT_FIRST_NAME": currentStudent.sortable_name.slice(currentStudent.sortable_name.indexOf(", ") + 2),
                            "OVERALL_SCORE": (currentScore != null) ? currentScore : "",
                            "ASSIGNMENT_NAME": this.assignments[k].name,
                            "ASSIGNMENT_DESCRIPTION": "Canvas URL: " + this.assignments[k].html_url,
                            "MAX_SCORE": this.assignments[k].points_possible,
                            "POINTS": this.assignments[k].points_possible,
                            "ASSIGNMENT_DATE": assignmentDate.toLocaleDateString(),
                            "DUE_DATE": dueDate.toLocaleDateString(),
                            "SCORE_TYPE": "Raw Score",
                            "ASSIGNMENT_TYPE": currentAssignmentType,
                            "EXCUSED": currentExcused,
                            "SHOW_ONLY_WHEN_SCORED": this.sows
                        })
                    }
                }
                else {
                    let currentDate = filterDate(new Date(Date.now()))
                    for (let k = 0; k < this.overallStudentGrades.length; k++) if (this.overallStudentGrades[k].sis_user_id == currentStudent.sis_user_id) {
                        exportJSON[currentSection].push({
                            "STUDENT_PERM_ID": this.overallStudentGrades[k].sis_user_id,
                            "STUDENT_LAST_NAME": this.overallStudentGrades[k].sortable_name.slice(0, this.overallStudentGrades[k].sortable_name.indexOf(", ")),
                            "STUDENT_FIRST_NAME": this.overallStudentGrades[k].sortable_name.slice(this.overallStudentGrades[k].sortable_name.indexOf(", ") + 2),
                            "OVERALL_SCORE": this.overallStudentGrades[k].score,
                            "ASSIGNMENT_NAME": "Canvas Overall Grade",
                            "ASSIGNMENT_DESCRIPTION": "Overall student grade from Canvas",
                            "MAX_SCORE": 100,
                            "POINTS": 100,
                            "ASSIGNMENT_DATE": currentDate.toLocaleDateString(),
                            "DUE_DATE": currentDate.toLocaleDateString(),
                            "SCORE_TYPE": "Raw Score",
                            "ASSIGNMENT_TYPE": overallGradeAssignmentType ? overallGradeAssignmentType : types[0],
                            "EXCUSED": false,
                            "SHOW_ONLY_WHEN_SCORED": false
                        })
                    }
                }

            }
        }

        this.convertedGrades = exportJSON
    }

    


    open() {
        super.open()
        if (!this.fetched) this.fetchGrades()
    }


}



function saveCourses() {
    let courseInfos = []
    for (let i = 0; i < courseSections.length; i++) {
        courseInfos.push({
            id: courseSections[i].id,
            name: courseSections[i].name,
            typeSelections: courseSections[i].typeSelections,
            sows: courseSections[i].sows,
            studentsToIgnore: courseSections[i].studentsToIgnore
        })
    }

    chrome.storage.local.set({courseInfos: JSON.stringify(courseInfos)}, () => {
        console.log("courses saved")
    })
}

var homeSection = new HomeSection()
var settingsSection = new SettingsSection()
var helpSection = new HelpSection()

headerHomeLink.onclick = () => {
    homeSection.sideBarLink.link.click()
}


homeSection.sideBarLink.link.click()


var courseSections = []

function getCoursesAsync() {
        
        getDataAsync(["users", "self", "courses"], accessToken).then((courses) => {
            console.log("courses", courses)
            var currentYearCourses = []
            for (let i = 0; i < courses.length; i++) {
                if (courses[i].sis_course_id != null && courses[i].sis_course_id.indexOf(currentSchoolYear) == 0) {
                    currentYearCourses.push(courses[i])
                }
            }

            homeSection.populateCurrentCourses(currentYearCourses)

        })

}




chrome.storage.local.get(["types", "overallGradeAssignmentType", "courseInfos"], (result) => {

    if (result.types != null) {
        types = JSON.parse(result.types)
        settingsSection.makeOverallGradeTypeOptions()
    }
    if (result.overallGradeAssignmentType != null) overallGradeAssignmentType = result.overallGradeAssignmentType

    if (result.courseInfos != null) {
        let courseInfos = JSON.parse(result.courseInfos)

        for (let i = 0; i < courseInfos.length; i++) {
            courseSections.push(new CourseSection(courseInfos[i]))
        }
    }
})

}
