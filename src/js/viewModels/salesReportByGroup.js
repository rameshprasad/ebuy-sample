/**
 * Copyright (c) 2014, 2017, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
/*
 * Your dashboard ViewModel code goes here
 */
define(['ojs/ojcore', 'knockout', 'jquery', 'models/apiServices', 'moment', 'ojs/ojknockout', 'promise', 'ojs/ojtable', 'ojs/ojinputtext', 'ojs/ojbutton', 'ojs/ojarraydataprovider'],
    function (oj, ko, $, apiServices, moment) {
        function SalesReportByGroup() {
            var self = this;
            self.salesDataArray = ko.observableArray([]);
            self.filter = ko.observable();
            self.highlightChars = [];
            self.dataprovider = new ko.observable();
            self.columnArray = ko.observableArray([]);
            
            self.groupsArray = [
                { groupId: 'user', groupName: 'User' },
                { groupId: 'product-zone', groupName: 'Product Zone' },
                { groupId: 'product', groupName: 'Product' }
            ];
            self.selectedGroup = ko.observable();
            self.selectedGroupId = ko.computed(function () {
                return self.selectedGroup() && self.selectedGroup().groupId;
            });

            self.selectedGroupChanged = function () {
                self.getSalesDataByGroup(self.selectedGroupId());

                self.columnArray([]);
                if (self.selectedGroupId() === 'user') {
                    self.columnArray(self.columnArrayForUsersGroup);
                }
                else if (self.selectedGroupId() === 'product') {
                    self.columnArray(self.columnArrayForProductGroup);
                }
                else if (self.selectedGroupId() === 'product-zone') {
                    self.columnArray(self.columnArrayForProductZoneGroup);
                }
            }

            
            // Below are a subset of the ViewModel methods invoked by the ojModule binding
            // Please reference the ojModule jsDoc for additional available methods.

            /**
             * Optional ViewModel method invoked when this ViewModel is about to be
             * used for the View transition.  The application can put data fetch logic
             * here that can return a Promise which will delay the handleAttached function
             * call below until the Promise is resolved.
             * @param {Object} info - An object with the following key-value pairs:
             * @param {Node} info.element - DOM element or where the binding is attached. This may be a 'virtual' element (comment node).
             * @param {Function} info.valueAccessor - The binding's value accessor.
             * @return {Promise|undefined} - If the callback returns a Promise, the next phase (attaching DOM) will be delayed until
             * the promise is resolved
             */
            self.handleActivated = function (info) {
                self.selectedGroup({ groupId: 'user', groupName: 'User' });
                self.columnArray(self.columnArrayForUsersGroup);
                self.getSalesDataByGroup(self.selectedGroupId());
            };

            /**
             * Optional ViewModel method invoked after the View is inserted into the
             * document DOM.  The application can put logic that requires the DOM being
             * attached here.
             * @param {Object} info - An object with the following key-value pairs:
             * @param {Node} info.element - DOM element or where the binding is attached. This may be a 'virtual' element (comment node).
             * @param {Function} info.valueAccessor - The binding's value accessor.
             * @param {boolean} info.fromCache - A boolean indicating whether the module was retrieved from cache.
             */
            self.handleAttached = function (info) {
                // Implement if needed
            };


            /**
             * Optional ViewModel method invoked after the bindings are applied on this View. 
             * If the current View is retrieved from cache, the bindings will not be re-applied
             * and this callback will not be invoked.
             * @param {Object} info - An object with the following key-value pairs:
             * @param {Node} info.element - DOM element or where the binding is attached. This may be a 'virtual' element (comment node).
             * @param {Function} info.valueAccessor - The binding's value accessor.
             */
            self.handleBindingsApplied = function (info) {
                // Implement if needed
            };

            /*
             * Optional ViewModel method invoked after the View is removed from the
             * document DOM.
             * @param {Object} info - An object with the following key-value pairs:
             * @param {Node} info.element - DOM element or where the binding is attached. This may be a 'virtual' element (comment node).
             * @param {Function} info.valueAccessor - The binding's value accessor.
             * @param {Array} info.cachedNodes - An Array containing cached nodes for the View if the cache is enabled.
             */
            self.handleDetached = function (info) {
                // Implement if needed
            };

            self.getSalesDataByGroup = function () {
                var params = {
                    groupBy: self.selectedGroupId()
                };
                var dsPromise = apiServices.execute('sales', 'get-sales-by-group', 'get', params);
                dsPromise.then(function (response) {
                    if (response && response.data) {
                        var responseDataArray = response.data;

                        for (var i = 0; i < responseDataArray.length; i++) {
                            responseDataArray[i].id = i + 1;
                        }

                        self.salesDataArray([]);
                        var unwrapArray = self.salesDataArray();
                        unwrapArray.push.apply(unwrapArray, responseDataArray);
                        self.salesDataArray.valueHasMutated();
                        self.dataprovider(null);
                        self.dataprovider(new oj.ArrayDataProvider(responseDataArray, { idAttribute: 'id' }));
                    }
                });
            };

            self.handleKeyUp = function () {
                self.highlightChars = [];
                var filter = document.getElementById('filter').rawValue;
                if (filter.length == 0) {
                    self.clearClick();
                    return;
                }
                var dataArray = [];
                var i, id;
                for (i = self.salesDataArray().length - 1; i >= 0; i--) {
                    id = self.salesDataArray()[i].id;
                    Object.keys(self.salesDataArray()[i]).forEach(function (field) {
                        if (self.salesDataArray()[i][field].toString().toLowerCase().indexOf(filter.toLowerCase()) >= 0) {
                            self.highlightChars[id] = self.highlightChars[id] || {};
                            self.highlightChars[id][field] = getHighlightCharIndexes(filter, self.salesDataArray()[i][field]);
                            if (dataArray.indexOf(self.salesDataArray()[i]) < 0) {
                                dataArray.push(self.salesDataArray()[i]);
                            }
                        }
                    });
                }
                dataArray.reverse();
                self.dataprovider(new oj.ArrayDataProvider(dataArray, { idAttribute: 'id' }));

                function getHighlightCharIndexes(highlightChars, text) {
                    var highlightCharStartIndex = text.toString().toLowerCase().indexOf(highlightChars.toString().toLowerCase());
                    return { startIndex: highlightCharStartIndex, length: highlightChars.length };
                };
            };

            self.clearClick = function (data, event) {
                self.filter('');
                self.dataprovider(new oj.ArrayDataProvider(self.salesDataArray(), { idAttribute: 'id' }));
                self.highlightChars = [];
                return true;
            }

            self.highlightingCellRendererForUser = function (context) {
                var id = context.row.id;
                var startIndex = null;
                var length = null;
                var field = null;
                if (context.columnIndex === 0) {
                    field = 'id';
                }
                else if (context.columnIndex === 1) {
                    field = 'username';
                }
                else if (context.columnIndex === 2) {
                    field = 'min_amount';
                }
                else if (context.columnIndex === 3) {
                    field = 'max_amount';
                }
                else if (context.columnIndex === 4) {
                    field = 'avg_amount';
                }
                else if (context.columnIndex === 5) {
                    field = 'total_amount';
                }
                else if (context.columnIndex === 6) {
                    field = 'total_products';
                }
                else if (context.columnIndex === 7) {
                    field = 'total_trans';
                }

                var data = context.row[field].toString();
                if (self.highlightChars[id] != null &&
                    self.highlightChars[id][field] != null) {
                    startIndex = self.highlightChars[id][field].startIndex;
                    length = self.highlightChars[id][field].length;
                }
                if (startIndex != null &&
                    length != null) {
                    var highlightedSegment = data.substr(startIndex, length);
                    data = data.substr(0, startIndex) + '<b>' + highlightedSegment + '</b>' + data.substr(startIndex + length, data.length - 1);
                }
                $(context.cellContext.parentElement).append(data);
            };

            self.highlightingCellRendererForProduct = function (context) {
                var id = context.row.id;
                var startIndex = null;
                var length = null;
                var field = null;
                if (context.columnIndex === 0) {
                    field = 'id';
                }
                else if (context.columnIndex === 1) {
                    field = 'product';
                }
                else if (context.columnIndex === 2) {
                    field = 'total_users';
                }
                else if (context.columnIndex === 3) {
                    field = 'total_sold';
                }
                else if (context.columnIndex === 4) {
                    field = 'total_revenue';
                }

                var data = context.row[field].toString();
                if (self.highlightChars[id] != null &&
                    self.highlightChars[id][field] != null) {
                    startIndex = self.highlightChars[id][field].startIndex;
                    length = self.highlightChars[id][field].length;
                }
                if (startIndex != null &&
                    length != null) {
                    var highlightedSegment = data.substr(startIndex, length);
                    data = data.substr(0, startIndex) + '<b>' + highlightedSegment + '</b>' + data.substr(startIndex + length, data.length - 1);
                }
                $(context.cellContext.parentElement).append(data);
            };

            self.highlightingCellRendererForProductZone = function (context) {
                var id = context.row.id;
                var startIndex = null;
                var length = null;
                var field = null;
                if (context.columnIndex === 0) {
                    field = 'id';
                }
                else if (context.columnIndex === 1) {
                    field = 'product-zone';
                }
                else if (context.columnIndex === 2) {
                    field = 'total_users';
                }
                else if (context.columnIndex === 3) {
                    field = 'total_sold';
                }
                else if (context.columnIndex === 4) {
                    field = 'total_revenue';
                }

                var data = context.row[field].toString();
                if (self.highlightChars[id] != null &&
                    self.highlightChars[id][field] != null) {
                    startIndex = self.highlightChars[id][field].startIndex;
                    length = self.highlightChars[id][field].length;
                }
                if (startIndex != null &&
                    length != null) {
                    var highlightedSegment = data.substr(startIndex, length);
                    data = data.substr(0, startIndex) + '<b>' + highlightedSegment + '</b>' + data.substr(startIndex + length, data.length - 1);
                }
                $(context.cellContext.parentElement).append(data);
            };

            self.columnArrayForUsersGroup = [{
                headerText: '#',
                renderer: self.highlightingCellRendererForUser
            },
            {
                headerText: 'User Name',
                renderer: self.highlightingCellRendererForUser
            },
            {
                headerText: 'Min Amount',
                renderer: self.highlightingCellRendererForUser
            },
            {
                headerText: 'Max Amount',
                renderer: self.highlightingCellRendererForUser
            },
            {
                headerText: 'Average Amount',
                renderer: self.highlightingCellRendererForUser
            },
            {
                headerText: 'Total Amount',
                renderer: self.highlightingCellRendererForUser
            },
            {
                headerText: 'Total Products',
                renderer: self.highlightingCellRendererForUser
            },
            {
                headerText: 'Total Transactions',
                renderer: self.highlightingCellRendererForUser
            }];

            self.columnArrayForProductGroup = [{
                headerText: '#',
                renderer: self.highlightingCellRendererForProduct
            },
            {
                headerText: 'Product',
                renderer: self.highlightingCellRendererForProduct
            },
            {
                headerText: 'Total Users',
                renderer: self.highlightingCellRendererForProduct
            },
            {
                headerText: 'Total Sold Quantity',
                renderer: self.highlightingCellRendererForProduct
            },
            {
                headerText: 'Total Revenue',
                renderer: self.highlightingCellRendererForProduct
            }];

            self.columnArrayForProductZoneGroup = [{
                headerText: '#',
                renderer: self.highlightingCellRendererForProductZone
            },
            {
                headerText: 'Product Zone',
                renderer: self.highlightingCellRendererForProductZone
            },
            {
                headerText: 'Total Users',
                renderer: self.highlightingCellRendererForProductZone
            },
            {
                headerText: 'Total Sold Quantity',
                renderer: self.highlightingCellRendererForProductZone
            },
            {
                headerText: 'Total Revenue',
                renderer: self.highlightingCellRendererForProductZone
            }];
        }

        /*
         * Returns a constructor for the ViewModel so that the ViewModel is constructed
         * each time the view is displayed.  Return an instance of the ViewModel if
         * only one instance of the ViewModel is needed.
         */
        return new SalesReportByGroup();
    }
);
