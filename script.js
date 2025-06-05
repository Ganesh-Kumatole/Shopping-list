// Selecting required elements from DOM
const form = document.querySelector("form");
const inputItem = document.getElementById("input-item");
const formBtn = document.getElementById("add-btn");
const sort = document.querySelector("div.sort");
const filter = document.querySelector("div.filter");
const list = document.querySelector("ul");
const clearBtn = document.querySelector("div.clearAll button#clear-btn");
let updateMode = false;
let isDuplicate = false;

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

function addItemToLocalStorage(item) {
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

function removeItemFromLocalStorage(ele) {
  const localStorageArr = JSON.parse(localStorage.getItem("items"));
  const targetItem_Index = localStorageArr.indexOf(ele.innerText);
  localStorageArr.splice(targetItem_Index, 1);
  localStorage.setItem("items", JSON.stringify(localStorageArr));
}

function addItemToList(item) {
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

function setItemtoUpdate(ele) {
  if (ele.tagName == "LI" || ele.tagName == "P") {
    updateMode = true;

    list.querySelectorAll("li").forEach((li) => {
      li.querySelector("p").style.color = "black";
    });

    if (ele.tagName == "LI") {
      ele.querySelector("p").style.color = "grey";
    } else if (ele.tagName == "P") {
      ele.style.color = "grey";
    }
    inputItem.value = ele.innerText;
    formBtn.id = "update-btn";
    formBtn.innerText = "Update Item";
  }
}

function displayStoredItems(e) {
  inputItem.value = "";

  JSON.parse(localStorage.getItem("items")).forEach((item) => {
    addItemToList(item);
  });

  resetUI();
}

function addItem_or_updateItem(e) {
  // Preventing default form submission
  e.preventDefault();

  // Reset the filter
  filter.querySelector("input#input-filter").value = "";

  // Validating the input
  if (inputItem.value == "") {
    alert("Item cannot be empty");
    return;
  }

  // Checking for duplicates
  list.querySelectorAll("li").forEach((li) => {
    if (li.querySelector("p").innerText === inputItem.value) {
      alert(`${inputItem.value} already exits!`);
      location.reload();
      isDuplicate = true;
      return;
    }
  });

  if (isDuplicate) {
    return;
  }

  console.log("object");

  // Checking the State: Add Or Update?
  if (updateMode) {
    list.querySelectorAll("li").forEach((li) => {
      if (li.querySelector("p").style.color == "grey") {
        // Remove from UI
        li.remove();

        // Remove from LocalStorage
        removeItemFromLocalStorage(li.querySelector("p"));

        // Reset state to Add
        formBtn.id = "add-btn";
        formBtn.innerText = "Add to List";
      }
    });
  }

  // Insert new item
  addItemToList(inputItem.value);

  // Add to localStorage
  addItemToLocalStorage(inputItem.value);

  // Reset UI
  resetUI();

  // Reset the input field
  inputItem.value = "";
}

function removeItem_or_setItemForUpdate(e) {
  // Click on cancel icon
  if (e.target.className === "fa-solid fa-xmark") {
    const targetItem = e.target.parentElement.parentElement;
    if (confirm(`Do you want to delete ${targetItem.innerText}?`)) {
      targetItem.remove();

      // Delete from LocalStorage
      removeItemFromLocalStorage(targetItem);
    }
  }
  // Click elsewhere within item
  else {
    setItemtoUpdate(e.target);
  }

  // Reset UI
  resetUI();
}

function clearAllItems(e) {
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

// Event Listeners
window.addEventListener("load", displayStoredItems);
form.addEventListener("submit", addItem_or_updateItem);
list.addEventListener("click", removeItem_or_setItemForUpdate);
clearBtn.addEventListener("click", clearAllItems);
filter
  .querySelector("input#input-filter")
  .addEventListener("input", filterItems);
resetUI();
