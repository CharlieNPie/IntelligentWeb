function newUser() {
  var formArray = $("form").serializeArray();
  var data = {};
  for (index in formArray) {
    data[formArray[index].name] = formArray[index].value;
  }
  $.ajax({
    url: "/users/create_user",
    data: data,
    dataType: "json",
    type: "POST",
    success: function (response) {
      console.log(response["newUser"]);
      location.replace('/')
    },
    error: function (xhr, status, error) {
      alert("Cannot create users when offline.");
    }
  });
}