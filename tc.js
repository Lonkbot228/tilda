!function (e) {
    let t = !1,                      // useCustomSubmit
        r = "popup",                 // cartMode
        a = "/cart",                 // cartPageUrl
        o = "normal",                // labelMode
        c = ".uc-custom-header",     // cartHeaderClass
        n = ".uc-custom-product",    // cartProductClass
        l = ".uc-empty-cart",        // cartEmptyClass
        i = ".uc-custom-success",    // cartSuccessClass
        u = ".uc-custom-orderform",  // cartOrderClass

        /**
         * Инициализация tkCart
         */
        _ = (opts = {}) => {
            t = opts.useCustomSubmit || t;
            r = opts.cartMode || r;
            a = opts.cartPageUrl || a;
            o = opts.labelMode || o;
            c = opts.cartHeaderClass || c;
            n = opts.cartProductClass || n;
            l = opts.cartEmptyClass || l;
            i = opts.cartSuccessClass || i;
            u = opts.cartOrderClass || u;

            H(); // инжектим стили

            t_onReady(() => {
                t_onFuncLoad("tcart__reDrawProducts", () => {
                    let interval = setInterval(() => {
                        if (!window.tcart) return;
                        clearInterval(interval);

                        F(); // клик по иконке корзины (static mode редирект)
                        if (("static" === r && window.location.pathname === a) || "popup" === r) {
                            tcart__reDrawProducts();
                            E(); // proxy для tcart
                            q(); // первый snapshot
                            w(); // объединение форм и кнопки submit
                            F();
                            if ("popup" === r) D(); // сборка кастомного popup
                        }
                    }, 100);
                });
            });
        },

        /**
         * Вставить элемент после другого
         */
        d = (refNode, newNode) => {
            refNode.parentNode.insertBefore(newNode, refNode.nextSibling);
        },

        /**
         * Обёртка над объектом для реакции на изменения (Proxy)
         */
        s = (obj, onChange) => {
            if ("object" != typeof obj || null === obj) return obj;
            return new Proxy(obj, {
                set: (target, prop, value) => {
                    target[prop] = value;
                    onChange(target);
                    return !0;
                },
                get: (target, prop) => {
                    if ("object" == typeof target[prop] && null !== target[prop]) {
                        return s(target[prop], onChange);
                    }
                    return target[prop];
                }
            });
        },

        /**
         * Простое состояние (store) для tcart snapshot
         */
        [p, $, m] = (initial => {
            let state = initial;
            let listeners = [];

            const setState = next => {
                state = next;
                listeners.forEach(fn => fn(state));
            };

            const subscribe = fn => {
                listeners.push(fn);
            };

            return [() => state, setState, subscribe];
        })([]),

        /**
         * Создание DOM-элемента товара на основе шаблона Zero-блока
         * e – данные продукта
         * t – currency_txt_l
         * r – currency_txt_r
         */
        y = (product, currencyL, currencyR) => {
            const template = document.querySelector(n);
            const clone = template.cloneNode(!0);

            // Картинка
            const imgAtom = clone.querySelector(`${n}__img .tn-atom`);
            if (imgAtom && product.img) {
                imgAtom.setAttribute(
                    "style",
                    `background-image:url('${product.img}'); background-size:cover;`
                );
            }

            // Название
            const nameAtom = clone.querySelector(`${n}__name .tn-atom`);
            if (nameAtom && product.name) {
                nameAtom.innerText = product.name;
                // Оборачиваем в ссылку, чтобы клик вёл на карточку товара
                const wrapped = `<a href="${product.url}" style="color: inherit; text-decoration: inherit;">${nameAtom.innerHTML}</a>`;
                nameAtom.innerHTML = wrapped;
            }

            // ОПИСАНИЕ ТОВАРА (НОВОЕ)
            // В Zero-блоке должен быть элемент с классом:
            // uc-custom-product__descr (можно совместить с js-store-prod-text и т.п.)
            const descrAtom = clone.querySelector(`${n}__descr .tn-atom`);
            if (descrAtom) {
                const descr = product.descr || "";
                descrAtom.innerText = descr;
            }

            // Артикул
            const skuAtom = clone.querySelector(`${n}__sku .tn-atom`);
            if (skuAtom && product.sku) {
                skuAtom.innerText = product.sku;
            }

            // Количество
            const qtyInput = clone.querySelector(`${n}__quantity [name="quantity"]`);
            if (qtyInput) {
                qtyInput.value = product.quantity;
            }

            // Сумма
            const amountAtom = clone.querySelector(`${n}__amount .tn-atom`);
            if (amountAtom) {
                amountAtom.innerText =
                    `${currencyL} ${new Intl.NumberFormat("ru-RU").format(product.amount)} ${currencyR}`;
            }

            // Кнопки + / - / удалить / ввод количества
            const plusBtn   = clone.querySelector(`${n}__quantity .t-inputquantity__btn-plus`);
            const minusBtn  = clone.querySelector(`${n}__quantity .t-inputquantity__btn-minus`);
            const qtyField  = clone.querySelector(`${n}__quantity [name="quantity"]`);
            const removeBtn = clone.querySelector(`${n}__remove`);

            plusBtn && plusBtn.addEventListener("click", () => {
                g(product.index);
            });

            minusBtn && minusBtn.addEventListener("click", () => {
                b(product);
            });

            qtyField && qtyField.addEventListener("focusout", evt => {
                C(evt, product);
            });

            removeBtn && removeBtn.addEventListener("click", () => {
                S(product.index);
            });

            qtyField && (qtyField.onkeydown = function (evt) {
                if ("Enter" === evt.key) evt.preventDefault();
            });

            return clone;
        },

        /**
         * Обработка состояния "пустая корзина" и рендера списка товаров
         */
        h = state => {
            const emptyBlock = document.querySelector(l);
            if (!emptyBlock) {
                console.error(
                    `Не найден блок, появляющийся при пустой корзине. Перепроверьте наличие этого блока и его класса ${l}`
                );
                return;
            }

            // Удаляем старые клоны
            const clones = document.querySelectorAll(`${n}--clone`);
            clones.forEach(el => el.remove());

            // Если нет товаров – показываем блок пустой корзины
            if (state.products.length === 0) {
                emptyBlock.classList.add("showed");
                return;
            }

            emptyBlock.classList.remove("showed");

            // Рисуем товары
            state.products.forEach(prod => {
                const node = y(prod, state.currency_txt_l, state.currency_txt_r);
                node.classList.add(`${n.slice(1)}--clone`);

                // вставляем после последнего template-блока
                const lastTemplate = Array.from(document.querySelectorAll(n)).pop();
                d(lastTemplate, node);
            });
        },

        /**
         * Обновление суммы заказа в кастомной форме
         */
        f = state => {
            document.querySelector(u); // просто "touch", на всякий случай

            const amountAtom = document.querySelector(`${u} ${u}__amount .tn-atom`);
            if (!amountAtom) return;

            amountAtom.innerText =
                `${state.currency_txt_l} ${new Intl.NumberFormat("ru-RU").format(state.amount)} ${state.currency_txt_r}`;
        },

        /**
         * Полный ререндер (товары + сумма)
         */
        v = state => {
            h(state);
            f(state);
        };

    // Подписка на изменения state
    m(v);

    // При ресайзе пересчёт
    window.addEventListener("resize", () => {
        setTimeout(() => {
            v(p());
        }, 1000);
    });

    /**
     * Создаём snapshot из window.tcart и кладём в наш store
     */
    let q = () => {
            if (!window.tcart) return;

            const cart = window.tcart;

            const snapshot = {
                amount: cart.amount,
                currency: cart.currency,
                currency_txt_l: cart.currency_txt_l,
                currency_txt_r: cart.currency_txt_r,
                delivery: cart.delivery,
                promocode: cart.promocode,
                products: cart.products.map((prod, index) => ({
                    index: index,
                    img: prod.img,
                    name: prod.name,
                    amount: prod.amount,
                    sku: prod.sku,
                    quantity: prod.quantity,
                    url: prod.url,
                    uid: prod.uid,
                    // ОПИСАНИЕ: берем из полей Tilda, по приоритету
                    descr: prod.descr || prod.description || prod.text || ""
                }))
            };

            $(snapshot);
        },

        /**
         * Удаление товара
         */
        S = index => {
            let el = document.querySelector(`.t706__product[data-cart-product-i="${index}"]`);
            if (!el) {
                tcart__reDrawProducts();
                el = document.querySelector(`.t706__product[data-cart-product-i="${index}"]`);
            }
            if (!el) {
                console.error("Не удалось найти продукт в корзине");
                return;
            }
            tcart__product__del(el);
            tcart__reDrawProducts();
        },

        /**
         * Увеличение количества
         */
        g = index => {
            let el = document.querySelector(`.t706__product[data-cart-product-i="${index}"]`);
            if (!el) {
                tcart__reDrawProducts();
                el = document.querySelector(`.t706__product[data-cart-product-i="${index}"]`);
            }
            if (!el) {
                console.error("Не удалось найти продукт в корзине");
                return;
            }
            tcart__product__plus(el);
        },

        /**
         * Уменьшение количества
         */
        b = product => {
            let el = document.querySelector(`.t706__product[data-cart-product-i="${product.index}"]`);
            if (!el) {
                tcart__reDrawProducts();
                el = document.querySelector(`.t706__product[data-cart-product-i="${product.index}"]`);
            }
            if (!el) {
                console.error("Не удалось найти продукт в корзине");
                return;
            }
            tcart__product__minus(el);
            if (product.quantity === 1) {
                tcart__reDrawProducts();
            }
        },

        /**
         * Ввод количества руками
         */
        C = (evt, product) => {
            let el = document.querySelector(`.t706__product[data-cart-product-i="${product.index}"]`);
            if (!el) {
                tcart__reDrawProducts();
                el = document.querySelector(`.t706__product[data-cart-product-i="${product.index}"]`);
            }
            if (!el) {
                console.error("Не удалось найти продукт в корзине");
                return;
            }

            let value = parseInt(evt.target.value, 10);
            tcart__product__updateQuantity(el, el, product.index, value > 0 ? value : 1);
        },

        /**
         * Proxy поверх window.tcart – чтобы ловить изменения
         */
        E = () => {
            window.tcart = s(window.tcart, q);
        },

        /**
         * Работа с формой оформления заказа в Zero-блоке
         */
        w = () => {
            let wrappers = document.querySelectorAll(`${u} ${u}__form`);
            if (wrappers.length > 1) {
                let merged = k(wrappers);
                P(wrappers);
                M(merged, `${u}__submit`);
            }

            let forms = [];
            wrappers.forEach(w => forms.push(w.querySelector("form")));

            // useCustomSubmit = true
            if (t && wrappers.length === 1) {
                P(wrappers);
                M(forms[0], `${u}__submit`);
            }

            // стандартный submit
            if (!t && wrappers.length === 1) {
                M(forms[0], ".tn-form__submit");
            }

            A(); // синхронизация полей
            T(); // обработка успеха заказа
        },

        /**
         * Объединяем все form в одну (классический приём для Zero)
         */
        k = wrappers => {
            let artboard = document.querySelector(`${u} .t396__artboard`);
            let wrapperDiv = document.createElement("div");

            wrapperDiv.innerHTML =
                '<form id="customForm" action="https://forms.tildacdn.com/procces/" method="POST" role="form" data-formactiontype="2" data-inputbox=".t-input-group" data-success-callback="t396_onSuccess" data-success-popup="y" data-error-popup="y"></form>';

            let mainForm = wrapperDiv.childNodes[0];
            wrappers.forEach(w => mainForm.appendChild(w));
            artboard.appendChild(mainForm);

            return mainForm;
        },

        /**
         * Поиск родительского .t-input-group
         */
        x = el => {
            let group = el?.closest(".t-input-group");
            if (!group) {
                console.error(
                    "Не смогли найти родительский t-input-group блок инпута",
                    el,
                    "\nОбратитесь разработчику: bystricky@tonky-kot.ru"
                );
            }
            return group;
        },

        /**
         * Определяем тип поля по data-field-type или классам
         */
        L = group => {
            let type = group.dataset.fieldType;
            let cls = group.getAttribute("class").split(" ")[1].split("_")[1];
            return type || cls;
        },

        /**
         * Синхронизация полей кастомной формы и стандартной формы корзины
         */
        A = () => {
            let inputs = document.querySelectorAll(
                `${u} .t-input-block input, ${u} .t-input-block textarea, ${u} .t-input-block select`
            );
            let names = new Set();

            inputs.forEach(input => {
                let name = input.getAttribute("name");
                if (!name) return;
                names.add(name);
            });

            names.forEach(name => {
                let customInputs = document.querySelectorAll(`${u} [name="${name}"]`);
                let cartInputs =
                    "sf" === name
                        ? document.querySelectorAll('.t706__orderform [data-field-type="sf"] input')
                        : document.querySelectorAll(`.t706__orderform [name="${name}"]`);

                let customGroup = x(customInputs[0]);
                let cartGroup = x(cartInputs[0]);

                let customType = L(customGroup);
                let cartType = L(cartGroup);

                if (customType !== cartType && !["dl", "sf"].includes(cartType)) {
                    console.error(
                        "Разные типы полей. Перепроверьте, одинаковые ли вы проставили variable для полей зеро блока и корзины",
                        customInputs[0],
                        cartInputs[0]
                    );
                }

                // enter в инпуте = клик по submit
                customInputs[0].onkeydown = function (evt) {
                    if ("Enter" == evt.key) {
                        let btn = document.querySelector(`${u} [type="submit"]`);
                        btn && btn.dispatchEvent(new Event("click"));
                    }
                };

                // Простые поля
                if (["em", "ph", "nm", "in", "ta", "sb", "da", "tm", "ur", "sf"].includes(customType)) {
                    if ("tm" === customType) {
                        customInputs[0].addEventListener("keyup", evt => {
                            cartInputs[0].value = evt.target.value;
                        });
                        return;
                    }
                    customInputs[0].addEventListener("change", evt => {
                        cartInputs[0].value = evt.target.value;
                        if ("ph" === customType) {
                            let maskInput = evt.target.parentNode.querySelector(
                                '.js-phonemask-result[type="hidden"]'
                            );
                            if (maskInput && evt.target.value !== maskInput.value) {
                                maskInput.dispatchEvent(new Event("change"));
                            }
                        }
                    });
                    return;
                }

                // Чекбоксы
                if (["cb"].includes(customType)) {
                    customInputs[0].addEventListener("change", evt => {
                        cartInputs[0].checked = evt.target.checked;
                    });
                    return;
                }

                // Радио / список / пр.
                if (["rd", "ri", "dl"].includes(customType)) {
                    if ("cb" === cartGroup.dataset.fieldRadcb) {
                        if (!customInputs[0]) {
                            console.error(
                                "Не смогли найти инпут чекбоксов для переменной:",
                                name
                            );
                            return;
                        }

                        let val = customInputs[0].value;
                        let observer = new MutationObserver(mutations => {
                            mutations.forEach(m => {
                                if (
                                    "attributes" === m.type &&
                                    "value" === m.attributeName &&
                                    customInputs[0].value !== val
                                ) {
                                    val = customInputs[0].value;
                                    customInputs[0].dispatchEvent(new Event("change"));
                                }
                            });
                        });

                        observer.observe(customInputs[0], { attributes: !0 });

                        customInputs[0].addEventListener("change", () => {
                            cartInputs[0].value = customInputs[0].value;
                        });
                    }

                    customInputs.forEach(ci => {
                        ci.addEventListener("change", evt => {
                            let ownAnswerCustom =
                                ci.parentNode.parentNode.querySelector(".t-input__own-answer");
                            let ownAnswerCart = cartGroup.querySelector(".t-input-ownanswer");

                            if (ownAnswerCustom && ownAnswerCart) {
                                ownAnswerCustom.addEventListener("change", e2 => {
                                    ownAnswerCart.value = e2.target.value;
                                });
                            }

                            let cartRadio = document.querySelector(
                                `.t706__orderform [value*="${ci.value}"]`
                            );
                            if (!cartRadio) {
                                console.error(
                                    "Не смогли найти радиокнопки в корзине с таким значением:",
                                    ci.value
                                );
                                return;
                            }
                            cartRadio.checked = evt.target.checked;
                            cartRadio.dispatchEvent(new Event("change"));
                        });
                    });
                    return;
                }
            });
        },

        /**
         * Отслеживаем успешное оформление заказа
         */
        T = () => {
            let originSuccess = window.tcart_success;

            Object.defineProperty(window, "tcart_success", {
                get: () => originSuccess,
                set(val) {
                    originSuccess = val;
                    if ("yes" === val) onSuccess();
                }
            });

            const onSuccess = () => {
                // скрываем иконку корзины
                let cartIcon = document.querySelector(".t706__carticon");
                cartIcon && cartIcon.classList.remove("t706__carticon_showed");

                let emptyBlock = document.querySelector(l);
                if (!emptyBlock) {
                    console.error(
                        `Не найден блок, появляющийся при пустой корзине. Перепроверьте наличие этого блока и его класса ${l}`
                    );
                    return;
                }

                let successBlock = document.querySelector(i);
                if (successBlock) {
                    let clones = document.querySelectorAll(`${n}--clone`);
                    clones.forEach(el => el.remove());

                    emptyBlock.classList.remove("showed");
                    successBlock.classList.add("showed");
                    return;
                }

                // если нет отдельного success-блока – чистим продукты
                let snapshot = p();
                let cleared = {
                    ...snapshot,
                    products: []
                };
                $(cleared);
            };
        },

        /**
         * Привязка кастомной кнопки submit к стандартной форме корзины
         */
        M = (form, submitSelector) => {
            let btn = document.querySelector(`${u} ${submitSelector}`);
            let cartForm = document.querySelector(".t706__orderform form");

            if (!btn) {
                console.error(
                    `Не удалось найти кастомную кнопку submit. Перепроверьте наличие кнопки с классом ${u}__submit в зеро блоке с классом ${u}`
                );
                return;
            }
            if (!cartForm) {
                console.error(
                    "Не удалось найти форму корзины. Возможно, на странице отсутствует блок ST100"
                );
                return;
            }

            btn.setAttribute("type", "submit");
            N(btn);

            btn.addEventListener("click", evt => {
                if ("tk-label" === evt.target.id) return;

                evt.preventDefault();
                evt.stopPropagation();

                let isEmpty = p().products.length === 0;
                if (isEmpty) {
                    alert("Cart is empty");
                    return;
                }

                window.tildaForm.hideErrors(form);
                let errors = window.tildaForm.validate(form);
                if (errors.length) {
                    window.tildaForm.showErrors(form, errors);
                    return;
                }

                cartForm.dispatchEvent(new Event("submit"));
            });
        },

        /**
         * Добавляем маленький label "Корзина сделана с помощью ..."
         */
        N = btn => {
            let [fs, gap, iconSize, extraStyle] =
                "big" === o
                    ? ["1rem", "0.5rem", "1.35rem", ""]
                    : "normal" === o
                        ? ["0.875rem", "0.25rem", "1.25rem", ""]
                        : "tiny" === o
                            ? ["0.75rem", "0.25rem", "1rem", ""]
                            : "hidden" === o
                                ? [
                                      "0.75rem",
                                      "0.25rem",
                                      "1rem",
                                      "opacity: 0 !important; pointer-events: none !important;"
                                  ]
                                : [ "0.875rem", "0.25rem", "1.25rem", "" ];

            let wrapper = document.createElement("div");
            wrapper.innerHTML =
                `<a href="https://tonky-kot.ru?utm_source=${window.location.host}&utm_campaign=cart" target="_blank" id="tk-label"  style="color: #8b8b8b !important; font-size: ${fs} !important; font-family: Arial, sans-serif !important; display: flex !important; gap: ${gap} !important; align-items: center !important; left: 0 !important; top: calc(100% + ${fs}) !important; position: absolute !important; white-space: nowrap !important; ${extraStyle}" onMouseOver="this.style.textDecoration='underline'" onMouseOut="this.style.textDecoration='none'">Корзина сделана с помощью<div style="width: ${iconSize}; height: ${iconSize};"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24" rx="12" fill="#1A73E8"></rect><path d="M13.5057 19.7987C13.6164 20.372 13.2409 20.9331 12.6586 20.9759C11.3625 21.071 10.0567 20.8845 8.83242 20.4242C7.2771 19.8393 5.91405 18.8354 4.89428 17.5235C3.8745 16.2116 3.23782 14.643 3.05478 12.9915C2.87173 11.3399 3.14946 9.66998 3.8572 8.16661C4.56494 6.66325 5.67506 5.38516 7.06456 4.47395C8.45406 3.56274 10.0687 3.05399 11.7296 3.00406C13.3905 2.95414 15.0327 3.36498 16.4745 4.19108C17.6093 4.84135 18.585 5.72893 19.3376 6.78849C19.6757 7.26455 19.4824 7.9114 18.97 8.19139L18.7057 8.33585C18.1933 8.61584 17.5571 8.42065 17.1988 7.9596C16.6742 7.28463 16.021 6.71551 15.2734 6.28716C14.2187 5.6828 13.0172 5.38223 11.8022 5.41876C10.5871 5.45529 9.40587 5.82748 8.38934 6.4941C7.37281 7.16072 6.56067 8.09574 6.0429 9.19558C5.52513 10.2954 5.32195 11.5171 5.45586 12.7253C5.58977 13.9335 6.05556 15.0811 6.8016 16.0409C7.54765 17.0006 8.54483 17.7351 9.68266 18.1629C10.4891 18.4662 11.3439 18.607 12.1984 18.5812C12.7821 18.5636 13.3379 18.9296 13.4486 19.5029L13.5057 19.7987Z" fill="white"></path><path d="M11.6355 11.6207C11.128 13.9678 11.204 16.0886 11.6355 16.6568C12.5177 17.8187 14.7258 16.3916 14.9838 20.275C15.0513 21.2916 20.8547 17.5639 20.9868 11.9471C21.1059 6.88685 18.8807 10.7252 17.4109 10.4313C17.3888 10.4268 17.1703 10.381 16.4725 10.233C15.7747 10.085 14.6311 10.233 14.1465 10.3255C14.1025 10.1053 13.9483 9.51407 13.684 8.91143C13.3536 8.15812 12.2699 8.68676 11.6355 11.6207Z" fill="white"></path><circle cx="17.2202" cy="13.282" r="1.40088" fill="#1A73E8"></circle><circle cx="14.5243" cy="12.6476" r="1.24229" fill="#1A73E8"></circle></svg></div></a>`;

            let label = wrapper.childNodes[0];
            btn.appendChild(label);
            wrapper.remove();
        },

        /**
         * Удаляем стандартные submit-кнопки Zero-форм
         */
        P = wrappers => {
            wrappers.forEach(w => w.querySelector(".tn-form__submit")?.remove());
        },

        /**
         * Сборка кастомного popup (режим cartMode="popup")
         */
        D = () => {
            let header = document.querySelector(c);
            let products = document.querySelectorAll(n);
            let empty = document.querySelector(l);
            let success = document.querySelector(i);
            let order = document.querySelector(u);

            let wrapper = document.createElement("div");
            wrapper.classList.add("custom-cart-popup");

            header && wrapper.appendChild(header);
            products.forEach(p => wrapper.appendChild(p));
            empty && wrapper.appendChild(empty);
            success && wrapper.appendChild(success);
            order && wrapper.appendChild(order);

            let cartWin = document.querySelector(".t706__cartwin");
            let cartContent = document.querySelector(".t706__cartwin-content");

            cartWin && wrapper && cartWin.appendChild(wrapper);
            cartContent && cartContent.setAttribute("style", "display: none;");
        },

        /**
         * Клик по иконке корзины – редирект на static page
         */
        F = () => {
            let iconWrapper = document.querySelector(".t706__carticon-wrapper");
            if (!iconWrapper) return;

            iconWrapper.addEventListener("click", evt => {
                if ("static" === r) {
                    evt.preventDefault();
                    evt.stopPropagation();
                    window.location.href = a;
                }
            });
        },

        /**
         * Инжектим стили для кастомной корзины
         */
        H = () => {
            let head = document.querySelector("head");
            let div = document.createElement("div");

            div.innerHTML =
                `<style rel="stylesheet">
${n}, ${l}, ${i} { display: none; }
${n}--clone { display: block; }
.showed { display: block; }
.custom-cart-popup { padding: 4rem 0; }
${u}__submit, ${n}__remove { cursor: pointer }
${n}__img .tn-atom { background-size: cover; }
</style>`;

            let styleTag = div.childNodes[0];
            head.appendChild(styleTag);
            div.remove();
        };

    e.tkCart = {
        init: _
    };
}(window);
