(function() {
  class Card {
    constructor(cardE) {
      this.allRF = false;
      this.cardE = cardE;
      if (!cardE.getAttribute('repos') && cardE.getAttribute('repos').toLowerCase() !== 'all') {
        this.repos = [];
        if (cardE.getAttribute('repo0')) {
          this.repos.push(cardE.getAttribute('repo0'));
        }
        if (cardE.getAttribute('repo1')) {
          this.repos.push(cardE.getAttribute('repo1'));
        }
      }else if(cardE.getAttribute('repos').toLowerCase() === 'all'){
        this.repos = 'all';
      }
      else {
        this.repos = cardE.getAttribute('repos').split(',');
      }
      this.username = cardE.getAttribute('username');
    }
    create() {
      if (!this.username) {
        console.log('Error00:Username not specified');
        return;
      }
      let http = new HttpJS();
      http.get('https://api.github.com/users/' + this.username).then((card) => {
        let cardC = document.createElement('div');
        cardC.classList.add('github-card-container');
        cardC.innerHTML =
          `
       <div class='github-card-header'>
           <img class='github-card-logo' src='github-logo.png'>
       </div>
       <div class='github-card-content'>
           <table class='github-card-image-text-wrap'>
               <td><img class='github-card-avatar' src='${card.avatar_url}' width=100></td>
               <td class='github-card-name'>
                   ${card.name}<br />
                   <span style='color:#222;font-size:9pt;'>Followers: ${card.followers} | Following: ${card.following}</span><br />
                   <a target='_blank' class='github-card-button' href='${card.html_url}'>View profile</a>
               </td>
           </table>
       </div><br><br><br><br>
`;
        this.cardE.appendChild(cardC);
      }).then(() => {
        if(this.repos === 'all'){this.allRF = true;}
        if (this.repos.length > 0 || this.allRF)  {
          try {
            http.get(`https://api.github.com/users/${this.username}/repos`).then((reposData) => {
              let reposFound = [];
              if(this.allRF){
                reposFound = reposData;
              }else{
                this.repos.forEach(function(userAddedRepos) {
                  reposData.forEach(function(userAllRepos) {
                    if (userAddedRepos.toLowerCase().trim() === userAllRepos.name.toLowerCase().trim()) {
                      reposFound.push(userAllRepos);
                    }
                  });
                });
              }
              if (reposFound.length > 0) {
                let cardC = this.cardE.querySelector('.github-card-container');
                cardC.innerHTML += "<span id='github-card-repo-headline' style='font-size:9pt;color:#777font-weight:bold;margin:text-align:center'><center>Repositories</center></span><div class='github-card-repos' id='github-card-repos'></div>";
                reposFound.forEach(function(card, i) {
                  if(!card.language){card.language = ' -';}
                  var div = document.createElement('div');
                  div.id = 'github-card-repo' + (i + 1);
                  div.innerHTML = "<a class='github-card-repo-headline' href=" + card.html_url + "><b>" + card.name + "</b></a><br><span class='github-card-repo-desc'>" + card.description + "</span><br><span class='gc-lang' style='font-size:8pt;'>&#9733;"+ card.language + "</span>";
                  div.classList.add('github-card-repo');
                  cardC.querySelector('.github-card-repos').appendChild(div);
                });
              }
            }).catch((err) => {
              console.log("Error02: " + err);
            });
          } catch {
            console.log("Error03");
          }
        }
      }).catch((err) => {
        console.log("Error01: " + err)
      });
    }
  }

  class HttpJS {
    constructor() {}
    get(url) {
      return new Promise(function(resolve, reject) {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.send();
        xhr.onreadystatechange = function(e) {
          if (xhr.readyState == 4) {
            if (xhr.status == 404) {
              reject('404');
            } else {
              resolve(JSON.parse(xhr.responseText));
            }
          }
        }
      });
    }
  }

  window.onload = function() {
    let link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = 'card.css';
    link.media = 'all';
    document.head.appendChild(link);
    document.querySelectorAll('.github-card').forEach(function(a) {
      let card = new Card(a);
      card.create();
    });
  }
})();
