//make space/table
document.addEventListener('DOMContentLoaded', function () {
    const table = document.getElementById('table');
    const totalAmount = document.getElementById('total');

    if (!table || !totalAmount) {
        console.error('Table or total element not found');
        return;
    }

    loadTableData();
    calculateTotal();
});

//add button for adding expenses to the table
function addExpense() {
    const nameInput = document.getElementById('name');
    const dateInput = document.getElementById('date');
    const priceInput = document.getElementById('price');

    if (!nameInput.value || !dateInput.value || !priceInput.value) {
        alert('Please fill in all fields');
        return;
    }

    // 8 cahr input
    const priceValue = priceInput.value.trim();
    if (!/^\d*\.?\d*$/.test(priceValue)) {
        alert('Please enter a valid number for the price');
        priceInput.value = ''; 
        priceInput.focus(); 
        return;
    }

    //localstorage -> add data to it
    const expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    const timestamp = new Date().getTime();

    expenses.push({ id: timestamp, name: nameInput.value, date: dateInput.value, price: '€' + priceValue });
    localStorage.setItem('expenses', JSON.stringify(expenses));

    loadTableData();
    nameInput.value = '';
    dateInput.value = '';
    priceInput.value = '';
}

//load table data
function loadTableData() {
    const table = document.getElementById('table');
    if (!table) {
        console.error('Table element not found');
        return;
    }
//add month system
    const selectedMonth = parseInt(document.getElementById('monthSelect').value, 10);
    const expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    const filteredExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() + 1 === selectedMonth;
    });
//add table content
    const headers = ['Name', 'Date', 'Amount'];
    table.innerHTML = '';
    const headerRow = table.insertRow(0);
    headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
    });
//filter expenses through months
    filteredExpenses.forEach(expense => {
        const newRow = table.insertRow(-1);
        newRow.insertCell(0).textContent = expense.name;
        newRow.insertCell(1).textContent = expense.date;
        newRow.insertCell(2).textContent = expense.price;

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'X';
        deleteButton.classList.add('delete-button');
        deleteButton.addEventListener('click', function () {
            const indexToDelete = expenses.findIndex(exp => exp.id === expense.id);
            if (indexToDelete !== -1) {
                expenses.splice(indexToDelete, 1);
                localStorage.setItem('expenses', JSON.stringify(expenses));
                loadTableData();
                calculateTotal();
            }
        });
        newRow.appendChild(deleteButton);
    });

    calculateTotal();
}

//swith month -> table load with that month content
function handleMonthChange(selectedMonth) {
    loadTableData(parseInt(selectedMonth, 10));
}

//calculate total expenses and total month expenses
function calculateTotal() {
    const totalAmount = document.getElementById('total');
    if (!totalAmount) {
        console.error('Total element not found');
        return;
    }

    const selectedMonth = parseInt(document.getElementById('monthSelect').value, 10);
    let totalSelectedMonth = 0;
    let totalAllMonths = 0;

    const expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    expenses.forEach(expense => {
        const amountValue = parseFloat(expense.price.replace('€', '').trim()) || 0;
        totalAllMonths += amountValue;
        const expenseDate = new Date(expense.date);
        if (expenseDate.getMonth() + 1 === selectedMonth) {
            totalSelectedMonth += amountValue;
        }
    });

    totalAmount.innerHTML = `
        Total for selected month (${getMonthName(selectedMonth)}): ${totalSelectedMonth.toFixed(2)} €<br>
        Total for all months: ${totalAllMonths.toFixed(2)} €
    `;
}

//add to text which month is clicked
function getMonthName(month) {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return monthNames[month - 1];
}
