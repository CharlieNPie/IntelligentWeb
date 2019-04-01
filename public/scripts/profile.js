const handleProfile = () => {
    let admin = JSON.parse(localStorage.getItem("admin"));
    let loggedin = JSON.parse(localStorage.getItem("login"));
    if (admin || loggedin) {
      $("#title").html("Profile");
      const logout =
        "<img src='https://image.flaticon.com/icons/svg/126/126467.svg' onclick='handleLogout()' class='back-button' />";
      $("#logout").html(logout);
      const ubox =
        "<div class='profile-box'><img src='https://pbs.twimg.com/profile_images/1059400736054935552/adJ8r021_400x400.jpg' /><p>Name: Borja Leiva</p><p>Location: Sheffield</p></div>";
      const abox =
        "<div class='profile-box'><img src='https://pixel.nymag.com/imgs/daily/intelligencer/2018/11/21/21-mark-zuckerberg-cnn.w700.h700.jpg' /><p>Name: Mark Suckerborg</p><p>Location: SF, California</p></div>";
      if (admin) {
        $("#content").append(abox);
      } else {
        $("#content").append(ubox);
      }
    } else {
      $("#title").html("Login");
      const box =
        "<div class='profile-box'><p>Username: </p>" +
        "<form id='login' onsubmit='handleLogin()'>" +
        "<input id='user' type='text' name='user' />" +
        "<span class='share'><input type='submit' class='submit' value='Login' form='login'/></span>" +
        "</form>" +
        "</div>";
      $("#content").append(box);
    }
  };
  
  const handleLogout = () => {
    localStorage.setItem("admin", false);
    localStorage.setItem("login", false);
    location.reload();
  };
  
  const handleLogin = () => {
    const user = $("#user").val();
    console.log(user);
    if (user == "admin") {
      localStorage.setItem("admin", true);
    } else if (user == "user") {
      localStorage.setItem("login", true);
    }
    location.reload();
  };
  