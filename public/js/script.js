var lock = new Auth0Lock('vcBcOaVmDWBXwgF8wsBctGBzsX7lGUhE', 'rattlesnakemilk.auth0.com', {
  auth: {
    params: {
      scope: 'openid email'
    }
  }
});

lock.on('authenticated',function (authResult) {
  //console.log(authResult);
  localStorage.setItem('idToken',authResult.idToken)
  loadStudents();
  showProfile()
});

//start
$(document).ready(function () {
  console.log('hello');

  $('#btn-login').on('click', function() {
    lock.show();
  })

  $('#btn-logout').on('click', function (e) {
  e.preventDefault();
  logout()
  })

  if (isLoggedIn()) {
  loadStudents();
  showProfile()
  }

  $('#postStudent').on('submit', addStudent)

})
//end

function addStudent(e) {
  e.preventDefault();
  e.stopPropagation();

  var first = $('#studentPostFirst').val()
  var last = $('#studentPostLast').val()

  $.ajax({
    type: 'Post',
    url: 'http://localhost:3000/students',
    data: {
      firstName: first,
      lastName: last
    },
    headers: {
      'Authorization':'Bearer '+localStorage.getItem('idToken')
    }
  }).done(loadStudent)


}

function isLoggedIn() {
  console.log('logged');
  if (localStorage.getItem('idToken')) {
  return isJwtValid();
  } else {
  return false;
  }
}

function isJwtValid() {
  var token = localStorage.getItem('idToken')
  if (!token) {
    return false;
  }
  var encodedPayload = token.split('.')[1]
  console.log('encodedPayload', encodedPayload);
  var decodedPayload = JSON.parse(atob(encodedPayload))
  console.log('decodedPayload', decodedPayload);
  var exp = decodedPayload.exp;
  console.log('exp', exp);
  var expirationDate = new Date(exp * 1000);
  console.log('expirationDate', expirationDate);
  return new Date() <= expirationDate
}


function loadStudents() {
  console.log('students');
  $.ajax({
    url: 'http://localhost:3000/students',
    headers: {
      'Authorization':'Bearer '+localStorage.getItem('idToken')
    }
  }) .done(function (data) {
    data.forEach(function (datum) {
    loadStudent(datum)
    })
  })
}

function loadStudent(data) {
  console.log(data);
  var li = $('<li />')
  li.text(data.firstName)

  $('#student-names').append(li)
  $('#studentPostFirst').val('')
  $('#studentPostLast').val('')

}

function showProfile() {
  console.log('showprofile');
  $('#btn-login').hide()
  $('#app-info').show()
  lock.getProfile(localStorage.getItem('idToken'),function (error,profile) {
    if (error) {
      logout()
    } else {
      console.log('profile',profile);
      $('#username').text(profile.nickname)
      $('#profilepic').attr('src',profile.picture)
  }
})
}

function logout() {
  localStorage.removeItem('idToken')
  window.location.href='/';
}
