

// RECIEVE MESSAGE //

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

    console.log(request.greeting)


    if (request.request == "getGrades") {
        getGradesForCourse(request.courseId, request.courseIndex, request.accessToken)
        
        sendResponse({confirmation: "thanks, I got it!", response: "finished"})
    }

    if (request.request == "getCourses") {
        let courses = getCourses(request.accessToken)
        console.log(courses)
        
        sendResponse({confirmation: "got it", response: "courses", courses: courses})
    }

})


// SEND MESSAGE //

function sendMessage(message) {
    chrome.runtime.sendMessage(message, function(response) {
        console.log(response)
    })
}


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
        //console.log(name)
        
        //console.log(header)
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


function getCourses(accessToken) {
    let coursesStartBy = new Date(2022, 6, 1)

    let userId = getData(["users", "self"], accessToken)[0].id
    
    let courses = getData(["users", userId, "courses"], accessToken)
    let currentDate = new Date(Date.now())
    let currentSchoolYear
    if (currentDate.getMonth() < 4) currentSchoolYear = currentDate.getFullYear()// 0 indexed
    else currentSchoolYear = currentDate.getFullYear() + 1// 0 indexed
    console.log(courses)
    var currentCourses = []
    for (let i = 0; i < courses.length; i++) {
        if (courses[i].sis_course_id != null && courses[i].sis_course_id.indexOf(currentSchoolYear) == 0) {
            currentCourses.push(courses[i])
        }
    }

    return currentCourses
}


function getGradesForCourse(courseId, courseIndex, accessToken) {
    if (accessToken == null) {
        console.log("access token not entered")
        return
    }

    getDataAsync(["courses", courseId, "sections", "?include[]=students"], accessToken).then((sections) => {
        sendMessage({message: "doneWithSections", sections: sections, courseIndex: courseIndex})
        console.log(sections)
    })

    getDataAsync(["courses", courseId, "assignments", "?include[]=all_dates"], accessToken).then((assignments) => {
        sendMessage({message: "doneWithAssignments", assignments: assignments, courseIndex: courseIndex})
        console.log(assignments)

        console.log("loading grades")
        var assignmentScores = []
        for (let i = 0; i < assignments.length; i++) {
            window.setTimeout(() => {
                getDataAsync(["courses", courseId, "assignments", assignments[i].id, "submissions"], accessToken).then((scores) => {
                    assignmentScores[i] = scores
    
                    let doneLoadingGrades = true
                    for (let j = 0; j < assignments.length; j++) if (assignmentScores[j] == null) doneLoadingGrades = false
                    if (doneLoadingGrades) {
                        sendMessage({message: "doneWithGrades", grades: assignmentScores, courseIndex: courseIndex})
                    
                        console.log(assignmentScores)
                    }
                })
            }, i * 150)
        }
        
    })

    getDataAsync(["courses", courseId, "assignment_groups"], accessToken).then((assignmentGroups) => {
        sendMessage({message: "doneWithGroups", assignmentGroups: assignmentGroups, courseIndex: courseIndex})
        console.log(assignmentGroups)
    })




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
