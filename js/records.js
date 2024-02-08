myApp = (function () {
  function AppView() {
    let appContainer = null;

    this.init = function (app) {
      appContainer = app;
      this.showTable();
    };

    this.showTable = function () {
      myAppDB
      .ref("users/")
      .once("value")
      .then(function (snapshot) {
        let userList = snapshot.val();
          let userListContainer = document.getElementById("users-list__container");
    
          if (!userListContainer) {
            document.getElementById("records_table").innerHTML += `
              <div class="columns">
                <div class="column">
                  <div class="users-list">
                    <h4 class="title is-4">Статистика игроков:</h4>
                    <table id="users-list" class="table is-bordered is-striped is-narrow is-hoverable is-fullwidth">
                      <thead>
                        <tr>
                          <th>Имя игрока</th>
                          <th>Игры</th>
                          <th>Победы</th>
                          <th>Поражения</th>
                          <th>Забито</th>
                          <th>Пропущено</th>
                          <th>Процент побед</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody id="users-list__container"></tbody>
                    </table>
                  </div>
                </div>
              </div>
              `;
            userListContainer = document.getElementById("users-list__container");
          } else {
            userListContainer.innerHTML = "";
          }
    
          for (let user in userList) {
            userListContainer.append(createRow(user, userList));
          }
    
          function createRow(user, userList) {
            let row = document.createElement("tr"),
            td1 = document.createElement("td"),
            td2 = document.createElement("td"),
            td3 = document.createElement("td");
            td4 = document.createElement("td");
            td5 = document.createElement("td");
            td6 = document.createElement("td");
            td7 = document.createElement("td");
            td8 = document.createElement("td");
            td1.innerHTML = `<strong>${user}</strong>`;
            td2.innerHTML = `${userList[user]['Игры']}`;
            td3.innerHTML = `${userList[user]['Победы']}`;
            td4.innerHTML = `${userList[user]['Поражения']}`;
            td5.innerHTML = `${userList[user]['Забито']}`;
            td6.innerHTML = `${userList[user]['Пропущено']}`;
            td7.innerHTML = `${Math.round(userList[user]['Победы']/userList[user]['Игры']*100)}%`;
            td8.innerHTML = `<a href="#" data-id=${user} class="delete is-medium" title="удалить пользователя">Удалить</a>`;
            row.append(td1);
            row.append(td2);
            row.append(td3);
            row.append(td4);
            row.append(td5);
            row.append(td6);
            row.append(td7);
            row.append(td8);
            return row;
          }
        })
      }
  }

  function AppModel() {
    let myAppView = null;

    this.init = function (view) {
      myAppView = view;
    };

    this.deleteUser = function (userid) {
      myAppDB
        .ref("users/" + userid)
        .remove()
        .then(function () {
        })
        .catch(function (error) {
          console.error("Ошибка удаления пользователя: ", error);
        });
        myAppView.showTable();
    };
  }

  function AppController() {
    let myAppModel = null,
      appContainer = null;

    this.init = function (app, model) {
      myAppModel = model;
      appContainer = app;

      this.addEventListeners();
    };

    this.addEventListeners = function () {
      appContainer.addEventListener("click", function (event) {
        form = appContainer.querySelector("#addNewUser");
        addBtn = appContainer.querySelector("#addBtn");

        if (event.target && event.target.classList.contains("delete")) {
          event.preventDefault();
          event.stopPropagation();
          myAppModel.deleteUser(event.target.dataset.id);
        }
      });
    };
  }

  return {
    init: function () {
      const myAppView = new AppView();
      const myAppModel = new AppModel();
      const myAppController = new AppController();

      myAppView.init(document.getElementById("records_table"));
      myAppModel.init(myAppView);
      myAppController.init(document.getElementById("records_table"), myAppModel);
    },
  };
  })();


myApp.init();

window.addEventListener('hashchange', () => {myApp = null})

