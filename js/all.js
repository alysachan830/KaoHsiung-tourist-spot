//命名需要用到的DOM元素
const wrap = document.querySelector('.wrap');
const chooseArea = document.getElementById('chooseArea');
const areaContent = document.querySelector('.areaContent');
const areaTitle = document.querySelector('.areaTitle');
const hotArea = document.querySelector('.hotArea');
const pageNumber = document.querySelector('.pageNumber');


//初始化狀態
//原本的JSON資料
let records = [];
//當下需要的資料。這會因應我所選行政區/頁數而改變
let list = [];
//當下頁數。這會因應我所選的頁數數字/上下一頁按鈕而改變
let currentPage = 1;

//監聽
chooseArea.addEventListener('change', dropDownValue)
hotArea.addEventListener('click', btnValue);
pageNumber.addEventListener('click', checkPageNum);

//抓取JSON資料
//建立XMLHttpRequest物件
const ajaxData = new XMLHttpRequest();
//在XMLHttpRequest物件開啟URL及提出get請求，注意這裏最後一個參數是true，即非同步
ajaxData.open('get','https://raw.githubusercontent.com/hexschool/KCGTravel/master/datastore_search.json',true);
//不用傳送任何資料到伺服器，所以是空值
ajaxData.send(null);
//等資料從伺服器送來後，才去撈裏面的資料
ajaxData.onload = function(){

    const data = JSON.parse(ajaxData.responseText);
     //把處理好的資料拉回全域變數records裏，因為之後會重複用到
    records = data.result.records;
    

    //在array裏只提取行政區名字，並把這些名字放到新的array裏
    const zoneNameArr = records.map( records => records.Zone);

    //刪除掉重複的行政區名字
    //indexOf()是指在該元素在array中第一次出現的位置
    const uniqueNameArr = zoneNameArr.filter( (element,index) => {
        return zoneNameArr.indexOf(element) === index;
    })
    
    //動態新增到選單裏面
    uniqueNameArr.forEach((element) => {
        chooseArea.innerHTML += `<option value="${element}">${element}</option>`;
    })

    //一打開網站時，預設頁面是第1頁
    updateList(1);
    renderList();
}

//撈選單的值，並更改標題
function dropDownValue(){
    areaTitle.innerHTML = chooseArea.value;

    updateList(1);
    renderList();
}

//撈按鈕的值，並更改標題
function btnValue(e){
    if(e.target.nodeName === 'INPUT'){
        areaTitle.innerHTML = e.target.value;
    }

    updateList(1);
    renderList();
}

function checkPageNum(e){
    if(e.target.className === 'pageIndex'){
        //注意pageNum本身是字串，這裏需要轉成數字
        let pageNumValue = parseInt(e.target.dataset.pageNum);
        updateList(pageNumValue);
        renderList();
    
    }else if(e.target.id === 'pageNext'){
        updateList(currentPage + 1);
        renderList();
    
    }else if(e.target.id === 'pagePrev'){
        updateList(currentPage - 1);
        renderList();
    }
}


//更新資料
function updateList(page) {
    //更新當下頁數。因為點選上下一頁時，都會拿當下頁數進行加減(在checkPageNum函式裏)
    //所以把這時候傳進來的參數拉回全域變數裏，以免在該函式裏，用了一個舊的currentPage去便做運算
    currentPage = page;
        
    //一打開網頁時，因為還沒選擇行政區，所以先抓取全部行政區
    if(areaTitle.textContent === ''){
        list = records;

    //抓所選行政區的資料
    }else{
        list = records.filter(item => item.Zone === areaTitle.textContent);
    }

    //計算資料數量可被分為多少個分頁
    let totalPage = Math.ceil(list.length / 6);
    
    let pageNumStr = '';
    for(let i=0; i<totalPage; i++){
        pageNumStr += 
        `
        <a href="#" class="pageIndex" data-page-num="${1+i}">${1+i}</a>
        `
    }
    //新增頁數
    pageNumber.innerHTML  = `<a href="#" id="pagePrev"> < prev</a>${pageNumStr}<a href="#" id="pageNext">next > </a>`

    //用目前所在頁數去做運算。如果是page1，就放頭6筆資料去list，如果是page2就放第6-12筆資料去list
        //e.g:
        //page 1:  index >= 0 && index <= 5  (1st - 6th data)
        //page 2:  index >= 6 && index <= 11 (7th - 12th data)
    
    //前置底線(把item寫成_item)是什麼意思？
    list = list.filter((_item, index) => index >= (page - 1) * 6 && index <= (page * 6) - 1); 

    //設定pageNext和pagePrev
    //最後頁數刪掉pageNext
    if(currentPage === totalPage && currentPage !== 1){
        document.getElementById('pageNext').remove();

    //第1頁刪掉pagePrev
    }else if(currentPage === 1 && totalPage > 1){
        document.getElementById('pagePrev').remove();
    
    //如果頁數只有1頁，刪掉pagePrev和pageNext 
    }else if(totalPage === 1){
        document.getElementById('pageNext').remove();
        document.getElementById('pagePrev').remove();
    }

    //更新目前所選頁數的顏色
    let currentPageLink = document.querySelector('[data-page-num="'+currentPage+ '"]');
    currentPageLink.style.color = '#559AC8';
}


//渲染資料
function renderList(){
    
    let content = list.map(item =>{
    return  `<li>
                <div class="spotImage" style="background-image:url(${item.Picture1})">
                    <h3 class="spotTitle">${item.Name}</h3>
                    <p class="spotArea">${item.Zone}</p>
                </div>
                <div class="spotText">
                    <p class="spotTime">${item.Opentime}</p>
                    <p class="spotVenue">${item.Add}</p>
                    <p class="spotTel">${item.Tel}</p>
                    <p class="spotPrice">${item.Ticketinfo}</p>
                </div>
            </li>`
    }).join('');

    areaContent.innerHTML = content;
}

