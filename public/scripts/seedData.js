function seedData() {
  return [
    {
      name: "Coachella",
      description:
        "The most exclusive festival you will find in this city. Happening only once every 10 years.",
      date: "12/05/2019",
      image: "https://i.imgur.com/Qp3tTtH.jpg",
      organiser: "93729347234",
      location: "Los Angeles",
      posts: [
        {
          id: "1",
          text:
            "This is one of the most colorful festivals I have ever been to! Anybody been to a better one?",
          avatar:
            "https://pbs.twimg.com/profile_images/1059400736054935552/adJ8r021_400x400.jpg",
          image:
            "https://cdn.images.dailystar.co.uk/dynamic/1/photos/645000/620x/Elrow-Town-festival-at-the-Queen-Elizabeth-Olympic-Park-in-Stratford-east-London-638902.jpg",
          author: "borjadotai",
          date: "12 May",
          location: "Los Angeles - 3rd Area",
          comments: [
            {
              author: "charliePie",
              avatar: "https://randomuser.me/api/portraits/men/14.jpg",
              text:
                "I went to one near Reading a few months ago and it was amazing. Defintiely worth going 💪🏼",
              date: "15 Jan"
            },
            {
              author: "hasanasim",
              avatar: "https://randomuser.me/api/portraits/men/17.jpg",
              text:
                "Nah, to be honest, I have not been to any like this one before. Pretty insane!",
              date: "17 Jan"
            }
          ]
        },
        {
          id: "2",
          text:
            "What time is Travis playing at? Completely lost track of time...",
          avatar:
            "https://tinyfac.es/data/avatars/7D3FA6C0-83C8-4834-B432-6C65ED4FD4C3-500w.jpeg",
          image: "https://media.timeout.com/images/101570805/630/472/image.jpg",
          author: "hasanasim",
          date: "14 May",
          location: "Los Angeles - 6th Area",
          comments: [
            {
              author: "charliePie",
              text: "Duuuuude he already played, you missed it..."
            }
          ]
        }
      ]
    },
    {
      name: "SheffieldFest",
      description:
        "The most exclusive festival you will find in this city. Happening only once every 10 years.",
      date: "12/06/2019",
      image: "https://i.imgur.com/jJHdo4D.jpg",
      organiser: "93729347235",
      location: "Sheffield",
      posts: [
        {
          id: "3",
          text: "Yoooo! Here watching Drake in the diamond, looking gooooood!",
          avatar:
            "https://tinyfac.es/data/avatars/7D3FA6C0-83C8-4834-B432-6C65ED4FD4C3-500w.jpeg",
          image: "https://i.imgur.com/jJHdo4D.jpg",
          author: "charliePie",
          date: "12/05/2019 - 15:30",
          location: "Sheffield - The Diamond",
          comments: [
            {
              author: "borjadotai",
              text: "I know right? Pretty sick!"
            }
          ]
        }
      ]
    }
  ];
}
