const students = [
    {name: "A", score: {mid: 100, final: 90}},
    {name: "B", score: {mid: 20, final: 75}},
    {name: "C", score: {mid: 80, final: 100}},
];

function findStudent(name) {
    for(let x = 0; x < students.length; x++) {
        if(students[x].name === name) return students[x];
    }
}

function findFirstName() {
    let first = students[0];

    for(let x = 1; x < students.length; x++) {
        if(students[x].name < first.name) {
            first = students[x];
        }
    }
    return first;
}

function findFirstPlace(scoreOf) {
    let max = 0;
    for(let x = 0; x < students.length; x++) {
        let result = scoreOf(students[x]);
        if(scoreOf(students[max]) < result) {
            max = x;
        }
    }
    return students[max];
}

findFirstPlace(function(s) { return s.score.mid; });    // 중간고사 1등
findFirstPlace(function(s) { return s.score.final; });  // 기말고사 1등
findFirstPlace(function(s) { return s.score.mid + s.score.final; }); // 총점 1등

function addStudent(name, midScore, finalScore) {
    students.push({name: name, score: {mid: midScore, final: finalScore}});
}