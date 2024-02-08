'use strict'

/* ----- spa init module --- */
const mySPA = (function() {

    /* ------- begin view -------- */
    function ModuleView() {
      let myModuleContainer = null;
      let menu = null;
      let contentContainer = null;
      let myApp;

      const HomeComponent = {
        id: "mainmenu",
        title: "Main",
        render: () => {
          return `
          <div class = 'menu main-menu' id="mainmenu">
          <div class = 'info'>
              <a id="new_game_link" href="#game">Новая игра</a>
              <a id="options_link" href="#options">Опции</a>
              <a id="rules_link" href="#rules">Правила игры</a>
              <a id="records_link" href="#records">Рекорды</a>
          </div>
      </div>
          `;
        }
      };

      const GameComponent = {
        id: "game",
        title: "Game",
        render: () => {
          return `
          <div id="game" class="game"></div>
          `;
        }
      };


      const OptionsComponent = {
        id: "options",
        title: "Options",
        render: () => {
          return `
            <div class="menu options-menu"> 
                <div class = 'info'>
                    <div class="form-field">
                        <label for="name-left">Введите имя игрока 1:</label>
                        <input id="name-left" class="input-name" value="Player1">
                        <label for="name-right">Введите имя игрока 2:</label>
                        <input id="name-right" class="input-name" value="Player2">
                        <p>Количество мячей, необходимых для победы:</p>
                        <div>
                            <label>1<input type="radio" name="howManyPoints" id="needToWin1" class="radio" value="1"></label>
                            <label>3<input type="radio" name="howManyPoints" id="needToWin3" class="radio" value="3" checked></label>
                            <label>5<input type="radio" name="howManyPoints" id="needToWin5" class="radio" value="5"></label>
                            <label>7<input type="radio" name="howManyPoints" id="needToWin7" class="radio" value="7"></label>
                            <label>10<input type="radio" name="howManyPoints" id="needToWin10" class="radio" value="10"></label>
                        </div>
                    </div>
                    <button onclick="window.history.back()" id="save_options" class="save">Сохранить</button>
                    <button onclick="window.history.back()" id="back_from_options" class="back">Назад</button>
                </div>
            </div>
            `;
        }
      };
    
      const RulesComponent = {
        id: "rules",
        title: "Rules",
        render: () => {
          return `
            <div class="menu rules-menu"> 
                <div class = 'info'>
                    <p class="rules-text"> 
                        Пользователи управляют только полевыми игроками. Вратари двигаются вдоль линии ворот самостоятельно. 
                        Полевые игроки могут перемещаться в пределах своей половины поля. Аутов в игре нет. После забитого гола
                        мяч возвращается в центр поля и игра возобновляется по истечении времени таймера. 
                    </p>
                    <button onclick="window.history.back()" id="back_from_rules" class="back" >Назад</button>
                </div>
            </div>
            `;
        }
      };

        const RecordsComponent = {
            id: "records",
            title: "Records",
            render: () => {
            return `
            <div class="menu records-menu" id='records'> 
              <div class = 'info'>
                <div id ='records_table'>
                </div>
                <button onclick="window.history.back()" id="back_from_records" class="back">Назад</button>
              </div>
            </div>
                `;
            }
        };
  
      const ErrorComponent = {
        id: "error",
        title: "Error...",
        render: () => {
          return `
            <div">
              <h1>Ошибка 404</h1>
              <p>Страница не найдена, попробуйте вернуться на <a href="#main">главную</a>.</p>
            </div>
          `;
        }
      };
  
      const router = {
        main: HomeComponent,
        game: GameComponent,
        rules: RulesComponent,
        options: OptionsComponent,
        records: RecordsComponent,
        default: HomeComponent,
        error: ErrorComponent
      };
  
      this.init = function(container) {
        myModuleContainer = container;
        menu = myModuleContainer.querySelector("#mainmenu");
        contentContainer = myModuleContainer.querySelector("#content");
      }
    
      this.renderContent = function(hashPageName) {
        let routeName = "default";
  
        if (hashPageName.length > 0) {
          routeName = hashPageName in router ? hashPageName : "error";
        }
  
        window.document.title = router[routeName].title;
        contentContainer.innerHTML = router[routeName].render(`${routeName}-page`);
      }

      this.addScript = function (hashPageName) {
        const script = document.createElement('script');
        script.setAttribute('id', 'script');
        script.async = false;        
        script.src = `./js/${hashPageName}.js`;
        document.body.appendChild(script);
      }

      this.removeOldScript = function () {
        const oldScript = document.querySelector('#script');
        if (oldScript) {
          oldScript.remove();
        }
      }
    };
    /* -------- end view --------- */
    /* ------- begin model ------- */
    function ModuleModel () {
        let myModuleView = null;
  
        this.init = function(view) {
          myModuleView = view;
        }
  
        this.updateState = function(hashPageName) {
          myModuleView.renderContent(hashPageName);
          myModuleView.removeOldScript();
          if (hashPageName !== 'rules' && hashPageName !== '') {
            myModuleView.addScript(hashPageName);
          }
        }
    }
  
    /* -------- end model -------- */
    /* ----- begin controller ---- */
    function ModuleController () {
      let myModuleContainer = null;
      let myModuleModel = null;
      let changePage = true;

      this.init = function(container, model) {
        myModuleContainer = container;
        myModuleModel = model;

        // вешаем слушателя на событие hashchange
        window.addEventListener("hashchange", this.updateState);
        this.updateState(); //первая отрисовка
      }

      this.updateState = function() {
        if (changePage) {
          console.log(changePage);
          console.log('srb');
          const hashPageName = location.hash.slice(1).toLowerCase();
          myModuleModel.updateState(hashPageName);
        } 
      }

    };
    /* ------ end controller ----- */
  
    
    return {
        init: function(container) {
          this.main(container);
  
          const view = new ModuleView();
          const model = new ModuleModel();
          const controller = new ModuleController();
  
          //связываем части модуля
          view.init(document.getElementById(container));
          model.init(view);
          controller.init(document.getElementById(container), model);
        },
  
        main: function(container) {
          console.log(`Иницилизируем SPA для контейнера "${container}"`);
        },
    };
  
  }());
  /* ------ end app module ----- */
  
  /*** --- init module --- ***/
  document.addEventListener("DOMContentLoaded", mySPA.init("container")); // инициализируем модуль как только DOM готов.

