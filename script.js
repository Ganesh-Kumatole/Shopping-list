// Selecting required elements from DOM
const form = document.querySelector('form');
const inputItem = document.getElementById('input-item');
const formBtn = document.getElementById('add-btn');
const sort = document.querySelector('div.sort');
const filter = document.querySelector('div.filter');
const notPurchasedList = document.querySelector('ul.not-purchased');
const purchasedList = document.querySelector('ul.purchased');
const clearBtn = document.querySelector('div.clearAll button#clear-btn');
const microphoneBtn = document.querySelector('div.microphone-icon');

let updateMode = false;
let isDuplicate = false;

// LocalStorage keys
const NOT_PURCHASED_KEY = 'notPurchased';
const PURCHASED_KEY = 'purchased';

const COLORS = {
  text: 'rgb(55, 55, 55)',
  muted: 'grey',
  accent: '#f3b859',
  background: '#fffbf2',
  danger: 'rgb(255, 71, 71)',
};

// Helpers for localStorage
function getLS(key) {
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : [];
}

function setLS(key, arr) {
  localStorage.setItem(key, JSON.stringify(arr));
}

function saveToNotPurchased(item) {
  const arr = getLS(NOT_PURCHASED_KEY);
  arr.push(item);
  setLS(NOT_PURCHASED_KEY, arr);
}

function saveToPurchased(item) {
  const arr = getLS(PURCHASED_KEY);
  arr.push(item);
  setLS(PURCHASED_KEY, arr);
}

function removeFromNotPurchased(itemText) {
  const arr = getLS(NOT_PURCHASED_KEY);
  const idx = arr.indexOf(itemText);
  if (idx > -1) {
    arr.splice(idx, 1);
    setLS(NOT_PURCHASED_KEY, arr);
  }
}

function removeFromPurchased(itemText) {
  const arr = getLS(PURCHASED_KEY);
  const idx = arr.indexOf(itemText);
  if (idx > -1) {
    arr.splice(idx, 1);
    setLS(PURCHASED_KEY, arr);
  }
}

function moveBetweenStorage(fromKey, toKey, itemText) {
  const fromArr = getLS(fromKey);
  const toArr = getLS(toKey);
  const idx = fromArr.indexOf(itemText);
  if (idx > -1) {
    fromArr.splice(idx, 1);
    toArr.push(itemText);
    setLS(fromKey, fromArr);
    setLS(toKey, toArr);
  }
}

function updateItemText(oldText, newText) {
  // try in notPurchased
  const notArr = getLS(NOT_PURCHASED_KEY);
  const notIdx = notArr.indexOf(oldText);
  if (notIdx > -1) {
    notArr[notIdx] = newText;
    setLS(NOT_PURCHASED_KEY, notArr);
    return true;
  }
  const purArr = getLS(PURCHASED_KEY);
  const purIdx = purArr.indexOf(oldText);
  if (purIdx > -1) {
    purArr[purIdx] = newText;
    setLS(PURCHASED_KEY, purArr);
    return true;
  }
  return false;
}

// UI helpers
function createButton(id) {
  const btn = document.createElement('button');
  btn.id = id;
  return btn;
}

function createIcon(classes) {
  const icon = document.createElement('i');
  icon.className = classes;
  return icon;
}

function getOrCreateHeading(listEl, headingClass, text) {
  if (!listEl) return null;
  // If a child heading with the class exists, reuse it
  const existing = listEl.querySelector('.' + headingClass);
  if (existing) return existing;

  // Create heading and insert as first child inside the list
  const h = document.createElement('h4');
  h.className = headingClass;
  h.textContent = text;
  h.style.display = 'none'; // hidden by default
  listEl.insertAdjacentElement('afterbegin', h);
  return h;
}

function resetUI() {
  // ensure headings exist (dynamic)
  const notHeading = getOrCreateHeading(
    notPurchasedList,
    'not-purchased-heading',
    'Yet to Buy...'
  );
  const purchasedHeading = getOrCreateHeading(
    purchasedList,
    'purchased-heading',
    'Already Purchased...'
  );

  if (notPurchasedList.querySelectorAll('li').length === 0) {
    filter.style.display = 'none';
    clearBtn.style.display = 'none';
    if (notHeading) notHeading.style.display = 'none';
  } else {
    filter.style.display = 'flex';
    clearBtn.style.display = 'block';
    if (notHeading) notHeading.style.display = 'block';
  }

  if (purchasedList.querySelectorAll('li').length === 0) {
    if (purchasedHeading) purchasedHeading.style.display = 'none';
  } else {
    if (purchasedHeading) purchasedHeading.style.display = 'block';
  }

  if (
    notPurchasedList.childElementCount === 1 &&
    purchasedList.childElementCount > 1
  ) {
    purchasedList.style.marginTop = '0px';
  } else {
    purchasedList.style.marginTop = '1.5rem';
  }
}

function addItemToList(item, purchased = false) {
  const li = document.createElement('li');

  // headings are handled dynamically by resetUI via getOrCreateHeading

  const div = document.createElement('div');
  div.className = 'checkbox-item-wrapper';

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';

  const p = document.createElement('p');
  p.className = 'item-name';
  p.textContent = item;

  div.append(checkbox);
  div.append(p);

  const cancelBtn = createButton('cancel-btn');
  const cancelIcon = createIcon('fa-solid fa-xmark');
  cancelBtn.append(cancelIcon);

  li.append(div);
  li.append(cancelBtn);

  if (purchased) {
    checkbox.checked = true;
    p.style.textDecoration = 'line-through';
    p.style.color = COLORS.muted;
    purchasedList.append(li);
  } else {
    notPurchasedList.append(li);
  }

  // update heading visibility
  resetUI();

  return li;
}

function setItemtoUpdate(ele) {
  const target =
    ele.tagName === 'P'
      ? ele.closest('li')
      : ele.tagName === 'LI'
      ? ele
      : ele.closest('li');
  if (!target) return;

  updateMode = true;

  // clear previous selection
  document
    .querySelectorAll('ul li')
    .forEach((li) => li.classList.remove('updating'));

  target.classList.add('updating');
  const p = target.querySelector('p.item-name');
  if (p) {
    p.style.color = COLORS.muted;
    inputItem.value = p.textContent;
    formBtn.id = 'update-btn';
    formBtn.innerText = 'Update Item';
  }
}

function displayStoredItems() {
  inputItem.value = '';

  const notPurchasedArr = getLS(NOT_PURCHASED_KEY);
  const purchasedArr = getLS(PURCHASED_KEY);

  // Clear current lists
  notPurchasedList.innerHTML = '';
  purchasedList.innerHTML = '';

  notPurchasedArr.forEach((item) => addItemToList(item, false));
  purchasedArr.forEach((item) => addItemToList(item, true));

  resetUI();
}

function addItem_or_updateItem(e) {
  e.preventDefault();

  // Reset the filter
  filter.querySelector('input#input-filter').value = '';

  const value = inputItem.value.trim();
  if (value === '') {
    alert('Item cannot be empty');
    return;
  }

  // Checking for duplicates across both lists
  const existingNot = getLS(NOT_PURCHASED_KEY);
  const existingPurchased = getLS(PURCHASED_KEY);
  if (
    !updateMode &&
    (existingNot.includes(value) || existingPurchased.includes(value))
  ) {
    alert(`${value} already exists!`);
    return;
  }

  if (updateMode) {
    // find the selected li
    const selected = document.querySelector('li.updating');
    if (selected) {
      const p = selected.querySelector('p.item-name');
      const oldText = p.textContent;
      // if new value is duplicate (and different from oldText) prevent
      if (
        value === oldText &&
        (existingNot.includes(value) || existingPurchased.includes(value))
      ) {
        alert(`${value} already exists!`);
        return;
      }

      p.textContent = value;
      p.style.color = COLORS.text;

      // update storage
      updateItemText(oldText, value);

      // clear update mode
      selected.classList.remove('updating');
      updateMode = false;
      formBtn.id = 'add-btn';
      formBtn.innerText = 'Add to List';
      inputItem.value = '';
      resetUI();
      return;
    }
  }

  // Insert new item
  addItemToList(value, false);

  // Add to localStorage (not purchased by default)
  saveToNotPurchased(value);

  // Reset UI
  resetUI();

  // Reset the input field
  inputItem.value = '';
}

function clickedCancelBtn(cancelBtn) {
  const respListItem = cancelBtn.closest('li');
  if (!respListItem) return;
  const text = respListItem.querySelector('p.item-name')?.textContent || '';
  if (confirm(`Do you want to delete ${text}?`)) {
    respListItem.remove();

    // Delete from LocalStorage
    if (text) {
      removeFromNotPurchased(text);
      removeFromPurchased(text);
    }

    resetUI();
  }
}

function clickedCheckbox(checkbox) {
  const respListItem = checkbox.closest('li');
  if (!respListItem) return;

  const p = respListItem.querySelector('p.item-name');
  const text = p ? p.textContent : '';

  if (checkbox.checked) {
    p.style.textDecoration = 'line-through';
    p.style.color = COLORS.muted;
    respListItem.remove();
    purchasedList.append(respListItem);
    moveBetweenStorage(NOT_PURCHASED_KEY, PURCHASED_KEY, text);
  } else {
    p.style.textDecoration = 'none';
    p.style.color = COLORS.text;
    respListItem.remove();
    notPurchasedList.append(respListItem);
    moveBetweenStorage(PURCHASED_KEY, NOT_PURCHASED_KEY, text);
  }

  resetUI();
}

function delegateClick(e) {
  // handle cancel icon click
  if (e.target.className === 'fa-solid fa-xmark') {
    clickedCancelBtn(e.target);
    return;
  }

  // handle checkbox toggle
  if (e.target.type === 'checkbox') {
    clickedCheckbox(e.target);
    return;
  }

  // handle clicks to set item for update
  const maybeLi = e.target.closest('li');
  if (maybeLi && maybeLi.closest('ul') === notPurchasedList) {
    if (e.target.tagName === 'P' || e.target.tagName === 'LI') {
      setItemtoUpdate(e.target);
    }
  }
}

function clearAllItems(e) {
  if (confirm('Do you want to Clear All Items?')) {
    const listItems = document.querySelectorAll('ul li');
    listItems.forEach((item) => item.remove());
    // clear both keys
    localStorage.removeItem(NOT_PURCHASED_KEY);
    localStorage.removeItem(PURCHASED_KEY);
  }

  // Reset UI
  resetUI();
}

function filterItems(e) {
  const filterInput = filter.querySelector('input#input-filter');
  const term = filterInput.value.trim().toLowerCase();

  notPurchasedList.querySelectorAll('li').forEach((item) => {
    const text = item.innerText.toLowerCase();
    if (!text.includes(term)) {
      item.style.display = 'none';
    } else {
      item.style.display = '';
    }
  });
}

// Speech Recognition Event Handler
function recognizeVoice(e) {
  const mikeIcon = microphoneBtn.querySelector('i');

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert(
      'Speech recognition not supported in this browser. Try Chrome on Android or use desktop.'
    );
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.continuous = false;

  recognition.onstart = () => console.log('Speech recognition started');
  recognition.onresult = (ev) => {
    const rcgText = ev.results[0][0].transcript.trim();
    inputItem.value = rcgText.length
      ? rcgText[0].toUpperCase() + rcgText.slice(1)
      : rcgText;
  };
  recognition.onerror = (ev) => {
    console.error('Speech recognition error', ev);
    alert('Speech recognition error: ' + (ev.error || 'unknown'));
    mikeIcon.classList.remove('fa-microphone-lines');
    mikeIcon.classList.add('fa-microphone-slash');
  };
  recognition.onend = () => {
    mikeIcon.classList.remove('fa-microphone-lines');
    mikeIcon.classList.add('fa-microphone-slash');
    console.log('Speech recognition ended');
  };

  // Start recognition on user click
  if (mikeIcon.classList.contains('fa-microphone-slash')) {
    mikeIcon.classList.remove('fa-microphone-slash');
    mikeIcon.classList.add('fa-microphone-lines');
    try {
      recognition.start();
    } catch (err) {
      console.error('recognition.start() failed', err);
    }
  } else {
    try {
      recognition.stop();
    } catch (err) {
      console.warn('recognition.stop() failed', err);
    }
    mikeIcon.classList.remove('fa-microphone-lines');
    mikeIcon.classList.add('fa-microphone-slash');
  }
}

function initializeApp() {
  window.addEventListener('load', displayStoredItems);
  microphoneBtn.addEventListener('click', recognizeVoice);
  form.addEventListener('submit', addItem_or_updateItem);
  notPurchasedList.addEventListener('click', delegateClick);
  purchasedList.addEventListener('click', delegateClick);
  clearBtn.addEventListener('click', clearAllItems);
  filter
    .querySelector('input#input-filter')
    .addEventListener('input', filterItems);
  resetUI();
}

initializeApp();
