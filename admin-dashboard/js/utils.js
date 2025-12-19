// Shared utilities for the admin dashboard

var AdminUtils = (function () {
    function getAjaxErrorMessage(jqXHR) {
        if (!jqXHR) return 'Request failed';

        if (jqXHR.responseJSON) {
            if (jqXHR.responseJSON.message) return jqXHR.responseJSON.message;

            if (jqXHR.responseJSON.errors) {
                try {
                    var parts = [];
                    Object.keys(jqXHR.responseJSON.errors).forEach(function (k) {
                        var msgs = jqXHR.responseJSON.errors[k];
                        if (Array.isArray(msgs)) {
                            msgs.forEach(function (m) { parts.push(m); });
                        }
                    });
                    if (parts.length) return parts.join('<br>');
                } catch (e) {
                    // fallthrough
                }
            }
        }

        if (jqXHR.responseText) return jqXHR.responseText;

        return 'Request failed';
    }

    function setSelectOptions($select, items, valueKey, labelKey, placeholder) {
        $select.empty();
        if (placeholder) {
            $select.append('<option value="">' + placeholder + '</option>');
        }
        (items || []).forEach(function (item) {
            $select.append('<option value="' + item[valueKey] + '">' + item[labelKey] + '</option>');
        });
    }

    function debounce(fn, wait) {
        var t;
        return function () {
            var ctx = this;
            var args = arguments;
            clearTimeout(t);
            t = setTimeout(function () {
                fn.apply(ctx, args);
            }, wait);
        };
    }

    function toFormData(map) {
        var fd = new FormData();
        Object.keys(map || {}).forEach(function (k) {
            var v = map[k];
            if (v === undefined || v === null) return;
            if (Array.isArray(v)) {
                v.forEach(function (item) {
                    fd.append(k + '[]', item);
                });
                return;
            }
            fd.append(k, v);
        });
        return fd;
    }

    return {
        getAjaxErrorMessage: getAjaxErrorMessage,
        setSelectOptions: setSelectOptions,
        debounce: debounce,
        toFormData: toFormData
    };
})();
