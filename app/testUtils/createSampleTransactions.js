import {ObjectID} from 'mongodb';

export default async function createSampleTransactions(dbHelper) {
    const regularTransaction = await dbHelper.createDoc('transactions', {
        account_id : "yMRMAYqV8mTM8bb5vDEjHyoy3PzE5XfO83yKO",
        account_owner : null,
        amount : 153.84,
        category : [ "Service", "Insurance" ],
        category_id : "18030000",
        date : "2019-05-20",
        iso_currency_code : "USD",
        name : "INSURANCE PYMT",
        pending : false,
        pending_transaction_id : "78R8Z74EkDTyYaaxZDkVf1nVQkNYe5TQLRmd0",
        transaction_id : "APKPDeY91vuxzKKLYZM5IRnonq4jzof6yeJEb",
        transaction_type : "special",
        was_budgeted : true,
        budget_category : "Renters Insurance"
    });
    const pendingTransaction = await dbHelper.createDoc('transactions', {
        account_id : "78R8Z74EkDTyYaaxZD3rSm6dwO8KApiQXL7Xg",
        account_owner : null,
        amount : 44.83,
        budget_category : "Eating Out",
        category : [
            "Food and Drink",
            "Restaurants",
            "Indian"
        ],
        category_id : "13005023",
        date : "2019-06-03",
        iso_currency_code : "USD",
        name : "House of India",
        pending : true,
        pending_transaction_id : null,
        transaction_id : "4aNazoeg30tqX55QjOnDI77pYe9DpmFkawRBx",
        transaction_type : "place",
        was_budgeted : true
    });
    const pendingTransaction2 = await dbHelper.createDoc('transactions', {
        amount : 30,
        budget_category : "Eating Out",
        date : "2019-06-03",
        name : "Adam is cool",
        pending : true,
        pending_transaction_id : null,
        transaction_id : "trans_id_for_pending_trans_adam_is_cool",
        transaction_type : "place",
        was_budgeted : true
    });
    // Also has memo
    const transactionWithOffsets = await dbHelper.createDoc('transactions', {
        account_id : "78R8Z74EkDTyYaaxZD3rSm6dwO8KApiQXL7Xg",
        account_owner : null,
        amount : 0.8799999999999955,
        budget_category : "Adam",
        category : [
            "Shops",
            "Supermarkets and Groceries"
        ],
        category_id : "19047000",
        date : "2019-05-28",
        iso_currency_code : "USD",
        memo : "Ran mom's deposit to Columbia",
        name : "Kroger",
        offsets : [
            ObjectID("5cf10e35aa434d72f1e47d5e")
        ],
        original_amount : 1000.88,
        pending : false,
        pending_transaction_id : "5mJm9bOgyjUBzNNR6K3NCyOj1wJ35PiBY5jQk",
        transaction_id : "78R8Z74EkDTyYaaxZDknibJVVeZ1nNIQnEQqv",
        transaction_type : "place",
        was_budgeted : true
    });
    const offsetCreditTransaction = await dbHelper.createDoc('transactions', {
        _id: ObjectID("5cf10e35aa434d72f1e47d5e"),
        account_id : "78R8Z74EkDTyYaaxZD3rSm6dwO8KApiQXL7Xg",
        account_owner : null,
        amount : -1000,
        category : [
            "Transfer",
            "Credit"
        ],
        category_id : "21005000",
        date : "2019-05-28",
        is_offset_transaction : true,
        iso_currency_code : "USD",
        name : "Zelle",
        pending : false,
        pending_transaction_id : "ZEyEbwmrn9cw5AAJkr7Aiezyj4zVe4cR5xKpe",
        transaction_id : "bQoQq3RPD4cO3bbLxrZgidann6zJXvUqzoqm7",
        transaction_type : "special",
        was_budgeted : false
    });
    const transferTransaction = await dbHelper.createDoc('transactions', {
        account_id : "95J5nVeEvdCkMxxeQK8asvPNXbdrkaIdEB5EN",
        account_owner : null,
        amount : -1000,
        category : [ "Transfer", "Credit" ],
        category_id : "21005000",
        date : "2019-05-06",
        is_offset_transaction : true,
        iso_currency_code : "USD",
        name : "FUNDS TRANSFER CR",
        pending : false,
        pending_transaction_id : "KjQj6e3K0DspMmmqjZ0Xi504bNQXJaiQgwo1j",
        transaction_id : "jEAELrnak8crdyyN70RMTBxjwDoPvnfRyZO7B",
        transaction_type : "special",
        was_budgeted : false
    });
    const apiTransaction = await dbHelper.createDoc('transactions', {
        account_id : "78R8Z74EkDTyYaaxZD3rSm6dwO8KApiQXL7Xg",
        account_owner: null,
        amount : 50,
        category : [
            "Food and Drink",
            "Restaurants",
            "Indian"
        ],
        category_id : "13005023",
        date : "2019-06-03",
        iso_currency_code: 'USD',
        location: {
            address: null,
            city: null,
            lat: null,
            lon: null,
            state: null,
            store_number: null,
            zip: null
        },
        name : "House of Indua",
        payment_meta: {
            by_order_of: null,
            payee: null,
            payer: null,
            payment_method: null,
            payment_processor: null,
            ppd_id: null,
            reason: null,
            reference_number: null
        },
        pending: false,
        pending_transaction_id: "4aNazoeg30tqX55QjOnDI77pYe9DpmFkawRBx",
        transaction_id : "APKPDeY91vuxzKKLYZy6tJRNP06BXpU6Ea801",
        transaction_type: 'place',
        unofficial_currency_code: null
    });
    await dbHelper.createDoc('transactions', {
        amount : 20,
        date : "2019-05-03",
        budget_category: 'Gas',
        name : "Gas Place Stop",
        was_budgeted: true
    });

    return { regularTransaction, pendingTransaction, pendingTransaction2, transactionWithOffsets, offsetCreditTransaction, transferTransaction, apiTransaction };
}
