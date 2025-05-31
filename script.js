// Selecting required elements from DOM
const form = document.querySelector("form");
const inputItem = document.getElementById("input-item");
const addBtn = document.getElementById("add-btn");
const filter = document.querySelector("div.filter");
const list = document.querySelector("ul");
const clearBtn = document.querySelector("div.clearAll button#clear-btn");

function createButton(id) {
  const btn = document.createElement("button");
  btn.id = id;
  return btn;
}

function createIcon(classes) {
  const icon = document.createElement("i");
  icon.className = classes;
  return icon;
}

function resetUI() {
  if (list.querySelectorAll("ul li").length === 0) {
    filter.style.display = "none";
    clearBtn.style.display = "none";
  } else {
    filter.style.display = "flex";
    clearBtn.style.display = "block";
  }
}

function displayStoredItems(e) {
  JSON.parse(localStorage.getItem("items")).forEach((item) => {
    addToList(item);
  });

  resetUI();
}

function addToLocalStorage(item) {
  // Array to store items
  let localStorageArr;

  if (localStorage.getItem("items") != null) {
    localStorageArr = JSON.parse(localStorage.getItem("items"));
    localStorageArr.push(item);
    localStorage.setItem("items", JSON.stringify(localStorageArr));
  } else {
    localStorageArr = [];
    localStorageArr.push(item);
    localStorage.setItem("items", JSON.stringify(localStorageArr));
  }
}

function addToList(item) {
  const li = document.createElement("li");
  const p = document.createElement("p");
  const cancelBtn = createButton("cancel-btn");
  const cancelIcon = createIcon("fa-solid fa-xmark");

  cancelBtn.append(cancelIcon);

  p.className = "item-name";
  p.textContent = item;

  li.append(p);
  li.append(cancelBtn);

  document.querySelector("ul").append(li);
}

function addToList_and_LocalStorage(e) {
  // Preventing default form submission
  e.preventDefault();

  // Reset the filter
  filter.querySelector("input#input-filter").value = "";

  // Validating the input
  if (inputItem.value == "") {
    alert("Item cannot be empty");
    return;
  }

  // Insert into list
  addToList(inputItem.value);

  // Reset UI
  resetUI();

  // Add to localStorage
  addToLocalStorage(inputItem.value);

  // Reset the input field
  inputItem.value = "";
}

function cancelItem(e) {
  // Target cancelIcon & traverse up till item, then remove

  const targetItem = e.target.parentElement.parentElement;

  if (e.target.className === "fa-solid fa-xmark") {
    if (confirm(`Do you want to delete ${targetItem.innerText}?`)) {
      targetItem.remove();

      // Delete from LocalStorage
      const localStorageArr = JSON.parse(localStorage.getItem("items"));
      const targetItem_Index = localStorageArr.indexOf(targetItem.innerText);
      localStorageArr.splice(targetItem_Index, 1);

      localStorage.setItem("items", JSON.stringify(localStorageArr));
    }
  }

  // Reset UI
  resetUI();
}

function clearItems(e) {
  if (confirm("Do you want to Clear All Items?")) {
    const listItems = document.querySelectorAll("ul li");
    listItems.forEach((item) => {
      item.remove();
    });
    localStorage.clear();
  }

  // Reset UI
  resetUI();
}

function filterItems(e) {
  const filterInput = filter.querySelector("input#input-filter");

  list.querySelectorAll("li").forEach((item) => {
    if (item.innerText.includes(filterInput.value) == false) {
      item.style.display = "none";
    } else {
      item.style.display = "flex";
    }
  });
}

form.addEventListener("submit", addToList_and_LocalStorage);
list.addEventListener("click", cancelItem);
clearBtn.addEventListener("click", clearItems);
filter
  .querySelector("input#input-filter")
  .addEventListener("input", filterItems);
window.addEventListener("load", displayStoredItems);
resetUI();
