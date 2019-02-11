function getProgramRequest(programId,year){
   let URL = `/programs/${programId}?year=${year}`;
   return APIrequest(URL);
}

function getStudentacademicsRequest(studentId,programId){
    let URL = `/students/${studentId}?program=${programId}`;
    return APIrequest(URL);
}

function APIrequest(URL){
  return new Promise(function(resolve,reject){
    $.ajax(URL)
    .done((data,status,xhr)=>{
      resolve(data)
    })
    .fail((data,status,xhr)=>{
      reject(data);
    });
  })
}
