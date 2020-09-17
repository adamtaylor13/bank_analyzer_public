import React from 'react';
import Categories from "./Categories";
import TransactionList from "./TransactionList";
import Admin from "./Admin";
import withFundsModal from '../FundsModal';
import FundMainView from "./Funds/FundMainView";
import CategoryDetail from "./CategoryDetail";
import EditTransaction from "../EditTransaction";
import FundDetailView from "./Funds/FundDetailView";
import FundTransferView from "./Funds/FundTransferView";
import EditCategory from "./EditCategory";
import FundCreateView from "./Funds/FundCreateView";
import NewCategory from "./NewCategory";
import BalanceCategory from "./Category/BalanceCategory";
import AccountsList from "./Accounts";

export const views = [
    {
        label: 'Categories',
        route: '/categories',
        component: Categories,
        icon: 'list',
        subviews: [
            {
                label: 'New Category',
                route: '/category/new',
                component: NewCategory,
                allowBack: true,
                exact: true,
            },
            {
                label: 'Edit Category',
                route: '/category/:catId/edit',
                component: EditCategory,
                allowBack: true,
                exact: true,
            },
            {
                label: 'Balance Category',
                route: '/category/:catId/balance',
                component: BalanceCategory,
                allowBack: true,
                exact: true,
            },
            {
                label: 'View Category Detail',
                route: '/category/:catId',
                component: CategoryDetail,
                allowBack: true,
            },
        ],
        exact: true,
    },
    {
        label: 'Accounts',
        route: '/accounts',
        component: AccountsList,
        icon: 'file-invoice-dollar',
    },
    {
        label: 'Sinking Funds',
        route: '/funds',
        component: withFundsModal(FundMainView),
        icon: 'funnel-dollar',
        subviews: [
            {
                label: 'Transfer Funds',
                route: '/funds/transfer',
                component: FundTransferView,
                allowBack: true,
                exact: true,
            },
            {
                label: 'Create New Fund',
                route: '/funds/new',
                component: FundCreateView,
                allowBack: true,
                exact: true,
            },
            {
                label: 'View Fund',
                route: '/funds/:fundId',
                component: FundDetailView,
                closeTo: '/funds',
                exact: true,
            },
        ],
        exact: true
    },
    {
        label: 'Admin',
        route: '/admin',
        component: Admin,
        icon: 'user-lock'
    },
    {
        label: 'Transaction List',
        route: '/transactions',
        component: TransactionList,
        icon: 'search-dollar',
        subviews: [
            {
                label: 'Edit Transaction',
                route: '/transactions/:id',
                component: EditTransaction,
                allowBack: true,
                exact: true,
            },
        ],
        exact: true,
    },
];

export const viewTags = Object.keys(views);

