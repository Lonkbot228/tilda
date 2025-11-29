!function (e) {
    let t = !1,
        r = "popup",
        a = "/cart",
        o = "normal",
        c = ".uc-custom-header",
        n = ".uc-custom-product",
        l = ".uc-empty-cart",
        i = ".uc-custom-success",
        u = ".uc-custom-orderform",

        // ИНИЦИАЛИЗАЦИЯ
        _ = (e = {}) => {
            t = e.useCustomSubmit || t;
            r = e.cartMode || r;
            a = e.cartPageUrl || a;
            o = e.labelMode || o;
            c = e.cartHeaderClass || c;
            n = e.cartProductClass || n;
            l = e.cartEmptyClass || l;
            i = e.cartSuccessClass || i;
            u = e.cartOrderClass || u;

            H();

            t_onReady(() => {
                t_onFuncLoad("tcart__reDrawProducts", () => {
                    let e = setInterval(() => {
                        if (!window.tcart) return;
                        clearInterval(e);
                        F();
                        if (
                            ("static" === r && window.location.pathname === a) ||
                            "popup" === r
                        ) {
                            tcart__reDrawProducts();
                            E();
                            q();
                            w();
                            F();
                            "popup" === r && D();
                        }
                    }, 100);
                });
            });
        },

        // ВСПОМОГАТЕЛЬНЫЕ
        d = (e, t) => {
            e.parentNode.insertBefore(t, e.nextSibling);
        },

        // РЕАКТИВНЫЙ СТОР ДЛЯ КОРЗИНЫ
        s = (e, t) =>
            "object" != typeof e || null === e
                ? e
                : new Proxy(e, {
                      set: (e, r, a) => ((e[r] = a), t(e), !0),
                      get: (e, r) =>
                          "object" == typeof e[r] && null !== e[r]
                              ? s(e[r], t)
                              : e[r],
                  }),

        // ПОДПИСКИ
        [p, $, m] = (e => {
            let t = e,
                r = [],
                a = e => {
                    t = e;
                    r.forEach(e => e(t));
                },
                o = e => {
                    r.push(e);
                };
            return [() => t, a, o];
        })([]),

        // СОЗДАНИЕ КЛОНА ТОВАРА ДЛЯ КАСТОМНОГО БЛОКА
        y = (e, t, r) => {
            let a = document.querySelector(n);
            if (!a) {
                console.error(
                    `[tkCart] Не найден шаблон товара с классом ${n}. Проверь класс товара.`
                );
                return;
            }

            let o = a.cloneNode(!0);

            // Картинка
            let imgAtom = o.querySelector(`${n}__img .tn-atom`);
            imgAtom &&
                imgAtom.setAttribute(
                    "style",
                    `background-image:url('${e.img}');`
                );

            // Название
            let nameAtom = o.querySelector(`${n}__name .tn-atom`);
            nameAtom && (nameAtom.innerText = e.name || "");

            // Артикул
            let skuAtom = o.querySelector(`${n}__sku .tn-atom`);
            skuAtom && (skuAtom.innerText = e.sku || "");

            // *** НОВОЕ: ОПИСАНИЕ ТОВАРА ***
            // Ищем текстовый элемент в Zero-блоке с классом uc-custom-product__descr
            let descrAtom = o.querySelector(`${n}__descr .tn-atom`);
            if (descrAtom) {
                // Берём описание из window.tcart.products[i].descr (если его нет — ставим пустую строку)
                descrAtom.innerHTML = e.descr || "";
            }

            // Количество
            let qtyInput = o.querySelector(`${n}__quantity [name="quantity"]`);
            qtyInput && (qtyInput.value = e.quantity);

            // Сумма
            let amountAtom = o.querySelector(`${n}__amount .tn-atom`);
            amountAtom &&
                (amountAtom.innerText = `${t} ${new Intl.NumberFormat(
                    "ru-RU"
                ).format(e.amount)} ${r}`);

            // Оборачиваем название ссылкой на товар
            if (nameAtom) {
                let nameWrapper = `<a href="${e.url}" style="color: inherit; text-decoration: inherit;">${nameAtom.innerHTML}</a>`;
                nameAtom.innerHTML = nameWrapper;
            }

            // ПЛЮС / МИНУС / ВВОД / УДАЛЕНИЕ
            let plusBtn = o.querySelector(
                    `${n}__quantity .t-inputquantity__btn-plus`
                ),
                minusBtn = o.querySelector(
                    `${n}__quantity .t-inputquantity__btn-minus`
                ),
                qtyField = o.querySelector(
                    `${n}__quantity  [name="quantity"]`
                ),
                removeBtn = o.querySelector(`${n}__remove`);

            plusBtn &&
                plusBtn.addEventListener("click", () => {
                    g(e.index);
                });

            minusBtn &&
                minusBtn.addEventListener("click", () => {
                    b(e);
                });

            qtyField &&
                qtyField.addEventListener("focusout", t => {
                    C(t, e);
                });

            removeBtn &&
                removeBtn.addEventListener("click", () => {
                    S(e.index);
                });

            qtyField &&
                (qtyField.onkeydown = function (e) {
                    "Enter" == e.key && e.preventDefault();
                });

            return o;
        },

        // ОТОБРАЖЕНИЕ / СКРЫТИЕ БЛОКА "ПУСТАЯ КОРЗИНА" + ДОБАВЛЕНИЕ КЛОНОВ ТОВАРОВ
        h = e => {
            let t = document.querySelector(l);
            if (!t) {
                console.error(
                    `Не найден блок, появляющийся при пустой корзине. Проверь наличие блока и класса ${l}`
                );
                return;
            }

            let r = document.querySelectorAll(`${n}--clone`);
            r.forEach(e => e.remove());

            if (0 === e.products.length) {
                t.classList.add("showed");
                return;
            }

            t.classList.remove("showed");

            e.products.forEach(tProd => {
                let rClone = y(tProd, e.currency_txt_l, e.currency_txt_r);
                if (!rClone) return;
                rClone.classList.add(`${n.slice(1)}--clone`);
                let a = Array.from(document.querySelectorAll(n)).pop();
                a && d(a, rClone);
            });
        },

        // ОБНОВЛЕНИЕ ИТОГОВОЙ СУММЫ В БЛОКЕ ФОРМЫ
        f = e => {
            let t = document.querySelector(
                `${u} ${u}__amount .tn-atom`
            );
            t &&
                (t.innerText = `${e.currency_txt_l} ${new Intl.NumberFormat(
                    "ru-RU"
                ).format(e.amount)} ${e.currency_txt_r}`);
        },

        // ГЛАВНЫЙ РЕНДЕР
        v = e => {
            h(e);
            f(e);
        };

    m(v);

    // ПЕРЕРИСОВКА НА РЕСАЙЗЕ (на всякий случай)
    window.addEventListener("resize", () =>
        setTimeout(() => {
            v(p());
        }, 1e3)
    );

    // СИНХРОНИЗАЦИЯ С window.tcart
    let q = () => {
            if (!window.tcart) return;

            let e = {
                amount: window.tcart.amount,
                currency: window.tcart.currency,
                currency_txt_l: window.tcart.currency_txt_l,
                currency_txt_r: window.tcart.currency_txt_r,
                delivery: window.tcart.delivery,
                promocode: window.tcart.promocode,

                // *** НОВОЕ: добавили descr в объект продукта ***
                products: window.tcart.products.map((prod, idx) => ({
                    index: idx,
                    img: prod.img,
                    name: prod.name,
                    descr: prod.descr || "", // описание товара из Tilda Store
                    amount: prod.amount,
                    sku: prod.sku,
                    quantity: prod.quantity,
                    url: prod.url,
                    uid: prod.uid,
                })),
            };

            $(e);
        },

        // УДАЛЕНИЕ ТОВАРА
        S = e => {
            let t = document.querySelector(
                `.t706__product[data-cart-product-i="${e}"]`
            );
            t ||
                (tcart__reDrawProducts(),
                (t = document.querySelector(
                    `.t706__product[data-cart-product-i="${e}"]`
                )));
            t || console.error("Не удалось найти продукт в корзине");
            tcart__product__del(t);
            tcart__reDrawProducts();
        },

        // ПЛЮС
        g = e => {
            let t = document.querySelector(
                `.t706__product[data-cart-product-i="${e}"]`
            );
            t ||
                (tcart__reDrawProducts(),
                (t = document.querySelector(
                    `.t706__product[data-cart-product-i="${e}"]`
                )));
            t || console.error("Не удалось найти продукт в корзине");
            tcart__product__plus(t);
        },

        // МИНУС
        b = e => {
            let t = document.querySelector(
                `.t706__product[data-cart-product-i="${e.index}"]`
            );
            t ||
                (tcart__reDrawProducts(),
                (t = document.querySelector(
                    `.t706__product[data-cart-product-i="${e.index}"]`
                )));
            t || console.error("Не удалось найти продукт в корзине");
            tcart__product__minus(t);
            1 === e.quantity && tcart__reDrawProducts();
        },

        // МАНУАЛЬНЫЙ ВВОД КОЛИЧЕСТВА
        C = (e, t) => {
            let r = document.querySelector(
                `.t706__product[data-cart-product-i="${t.index}"]`
            );
            r ||
                (tcart__reDrawProducts(),
                (r = document.querySelector(
                    `.t706__product[data-cart-product-i="${t.index}"]`
                )));
            r || console.error("Не удалось найти продукт в корзине");

            let a = parseInt(e.target.value, 10);
            tcart__product__updateQuantity(
                r,
                r,
                t.index,
                a > 0 ? a : 1
            );
        },

        // ПАТЧИМ window.tcart ЧЕРЕЗ PROXY
        E = () => {
            window.tcart = s(window.tcart, q);
        },

        // РАБОТА С ФОРМОЙ
        w = () => {
            let e = document.querySelectorAll(`${u} ${u}__form`);
            if (!e.length) return;

            if (e.length > 1) {
                let r = k(e);
                P(e);
                M(r, `${u}__submit`);
            }

            let a = [];
            e.forEach(e => a.push(e.querySelector("form")));

            t && 1 === e.length && (P(e), M(a[0], `${u}__submit`));

            t || (1 !== e.length || M(a[0], ".tn-form__submit"));

            A();
            T();
        },

        // СЛИЯНИЕ НЕСКОЛЬКИХ ФОРМ В ОДНУ
        k = e => {
            let t = document.querySelector(`${u} .t396__artboard`),
                r = document.createElement("div");
            r.innerHTML =
                '<form id="customForm" action="https://forms.tildacdn.com/procces/" method="POST" role="form" data-formactiontype="2" data-inputbox=".t-input-group" data-success-callback="t396_onSuccess" data-success-popup="y" data-error-popup="y"></form>';

            let a = r.childNodes[0];
            e.forEach(e => a.appendChild(e));
            t.appendChild(a);
            return a;
        },

        x = e => {
            let t = e?.closest(".t-input-group");
            t ||
                console.error(
                    `Не нашли родительский t-input-group для инпута`,
                    e,
                    "\nОбратитесь разработчику: bystricky@tonky-kot.ru"
                );
            return t;
        },

        L = e => {
            let t = e.dataset.fieldType,
                r = e.getAttribute("class").split(" ")[1].split("_")[1];
            return t || r;
        },

        // СИНХРОНИЗАЦИЯ ПОЛЕЙ ЗЕРО-БЛОКА И СТАНДАРТНОЙ КОРЗИНЫ
        A = () => {
            let e = document.querySelectorAll(
                    `${u} .t-input-block input, ${u} .t-input-block textarea, ${u} .t-input-block select`
                ),
                t = new Set();
            e.forEach(e => {
                let r = e.getAttribute("name");
                if (!r) return;
                t.add(r);
            });

            t.forEach(eName => {
                let tInputs = document.querySelectorAll(
                        `${u} [name="${eName}"]`
                    ),
                    rInputs =
                        "sf" === eName
                            ? document.querySelectorAll(
                                  '.t706__orderform [data-field-type="sf"] input'
                              )
                            : document.querySelectorAll(
                                  `.t706__orderform [name="${eName}"]`
                              ),
                    aGroup = x(tInputs[0]),
                    oGroup = x(rInputs[0]),
                    cType = L(aGroup),
                    nType = L(oGroup);

                if (cType !== nType && !["dl", "sf"].includes(nType)) {
                    console.error(
                        "Разные типы полей. Проверьте одинаковые ли переменные (variable) у полей Zero-блока и корзины",
                        tInputs[0],
                        rInputs[0]
                    );
                    return;
                }

                // Запретить отправку по Enter
                tInputs[0].onkeydown = function (e) {
                    if ("Enter" == e.key) {
                        let t = document.querySelector(
                            `${u} [type="submit"]`
                        );
                        t && t.dispatchEvent(new Event("click"));
                    }
                };

                // простые типы
                if (
                    [
                        "em",
                        "ph",
                        "nm",
                        "in",
                        "ta",
                        "sb",
                        "da",
                        "tm",
                        "ur",
                        "sf",
                    ].includes(cType)
                ) {
                    if ("tm" === cType) {
                        tInputs[0].addEventListener("keyup", e => {
                            rInputs[0].value = e.target.value;
                        });
                        return;
                    }

                    tInputs[0].addEventListener("change", e => {
                        rInputs[0].value = e.target.value;
                        if ("ph" === cType) {
                            let tMask =
                                e.target.parentNode.querySelector(
                                    '.js-phonemask-result[type="hidden"]'
                                );
                            tMask &&
                                e.target.value !== tMask.value &&
                                tMask.dispatchEvent(new Event("change"));
                        }
                    });
                    return;
                }

                // чекбокс
                if (["cb"].includes(cType)) {
                    tInputs[0].addEventListener("change", e => {
                        rInputs[0].checked = e.target.checked;
                    });
                    return;
                }

                // radio / dropdown / dl
                if (["rd", "ri", "dl"].includes(cType)) {
                    if ("cb" === oGroup.dataset.fieldRadcb) {
                        if (!tInputs[0]) {
                            console.error(
                                "Не смогли найти инпут чекбоксов для переменной:",
                                eName
                            );
                            return;
                        }
                        let lVal = tInputs[0].value,
                            iObs = new MutationObserver(muts => {
                                muts.forEach(m => {
                                    if (
                                        "attributes" === m.type &&
                                        "value" === m.attributeName &&
                                        tInputs[0].value !== lVal
                                    ) {
                                        lVal = tInputs[0].value;
                                        tInputs[0].dispatchEvent(
                                            new Event("change")
                                        );
                                    }
                                });
                            });
                        iObs.observe(tInputs[0], {
                            attributes: !0,
                        });
                        tInputs[0].addEventListener("change", () => {
                            rInputs[0].value = tInputs[0].value;
                        });
                    }

                    tInputs.forEach(tEl => {
                        tEl.addEventListener("change", ev => {
                            let rOwn = tEl.parentNode.parentNode.querySelector(
                                    ".t-input__own-answer"
                                ),
                                aOwn = oGroup.querySelector(
                                    ".t-input-ownanswer"
                                );
                            if (rOwn) {
                                if (!aOwn) {
                                    console.error(
                                        "Не нашли инпут своего варианта ответа в корзине"
                                    );
                                } else {
                                    rOwn.addEventListener("change", e => {
                                        aOwn.value = e.target.value;
                                    });
                                }
                            }
                            let cRadio = document.querySelector(
                                `.t706__orderform [value*="${tEl.value}"]`
                            );
                            if (!cRadio) {
                                console.error(
                                    "Не нашли радиокнопку в корзине с таким значением:",
                                    tEl.value
                                );
                                return;
                            }
                            cRadio.checked = ev.target.checked;
                            cRadio.dispatchEvent(new Event("change"));
                        });
                    });

                    return;
                }
            });
        },

        // ОТСЛЕЖИВАНИЕ УСПЕШНОГО ЗАКАЗА
        T = () => {
            let e = window.tcart_success;
            Object.defineProperty(window, "tcart_success", {
                get: () => e,
                set(r) {
                    e = r;
                    "yes" === r && tSuccess();
                },
            });

            let tSuccess = () => {
                let eIcon = document.querySelector(".t706__carticon");
                eIcon && eIcon.classList.remove("t706__carticon_showed");

                let tEmpty = document.querySelector(l);
                if (!tEmpty) {
                    console.error(
                        `Не найден блок для пустой корзины. Проверь класс ${l}`
                    );
                    return;
                }

                let rSuccess = document.querySelector(i);
                if (rSuccess) {
                    let aClones = document.querySelectorAll(`${n}--clone`);
                    aClones.forEach(e => e.remove());
                    tEmpty.classList.remove("showed");
                    rSuccess.classList.add("showed");
                    return;
                }

                let oCart = p(),
                    cEmpty = {
                        ...oCart,
                        products: [],
                    };
                $(cEmpty);
            };
        },

        // ПЕРЕВЯЗКА КАСТОМНОЙ SUBMIT-КНОПКИ С ФОРМОЙ КОРЗИНЫ
        M = (e, t) => {
            let r = document.querySelector(`${u} ${t}`),
                a = document.querySelector(".t706__orderform form");
            if (!r) {
                console.error(
                    `Не найден кастомный submit. Проверь наличие кнопки с классом ${u}__submit в Zero-блоке ${u}`
                );
                return;
            }
            if (!a) {
                console.error(
                    "Не удалось найти форму корзины. Возможно, на странице нет блока ST100"
                );
                return;
            }

            r.setAttribute("type", "submit");
            N(r);

            r.addEventListener("click", tEv => {
                if ("tk-label" === tEv.target.id) return;
                tEv.preventDefault();
                tEv.stopPropagation();

                let isEmpty = 0 === p().products.length;
                if (isEmpty) {
                    alert("Cart is empty");
                    return;
                }

                window.tildaForm.hideErrors(e);
                let oErrors = window.tildaForm.validate(e);
                if (oErrors.length) {
                    window.tildaForm.showErrors(e, oErrors);
                    return;
                }

                a.dispatchEvent(new Event("submit"));
            });
        },

        // ЛЕЙБЛ "СДЕЛАНО ТОНКИМ КОТОМ"
        N = e => {
            let [tSize, rGap, aIcon, cExtra] =
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
                              "opacity: 0 !important; pointer-events: none !important;",
                          ]
                        : [],
                nWrap = document.createElement("div");

            nWrap.innerHTML = `<a href="https://tonky-kot.ru?utm_source=${window.location.host}&utm_campaign=cart" target="_blank" id="tk-label"  style="color: #8b8b8b !important; font-size: ${tSize} !important; font-family: Arial, sans-serif !important; display: flex !important; gap: ${rGap} !important; align-items: center !important; left: 0 !important; top: calc(100% + ${tSize}) !important; position: absolute !important; white-space: nowrap !important; ${cExtra}" onMouseOver="this.style.textDecoration='underline'" onMouseOut="this.style.textDecoration='none'">Корзина сделана с помощью<div style="width: ${aIcon}; height: ${aIcon};"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24" rx="12" fill="#1A73E8"></rect><path d="M13.5057 19.7987C13.6164 20.372 13.2409 20.9331 12.6586 20.9759C11.3625 21.071 10.0567 20.8845 8.83242 20.4242C7.2771 19.8393 5.91405 18.8354 4.89428 17.5235C3.8745 16.2116 3.23782 14.643 3.05478 12.9915C2.87173 11.3399 3.14946 9.66998 3.8572 8.16661C4.56494 6.66325 5.67506 5.38516 7.06456 4.47395C8.45406 3.56274 10.0687 3.05399 11.7296 3.00406C13.3905 2.95414 15.0327 3.36498 16.4745 4.19108C17.6093 4.84135 18.585 5.72893 19.3376 6.78849C19.6757 7.26455 19.4824 7.9114 18.97 8.19139L18.7057 8.33585C18.1933 8.61584 17.5571 8.42065 17.1988 7.9596C16.6742 7.28463 16.021 6.71551 15.2734 6.28716C14.2187 5.6828 13.0172 5.38223 11.8022 5.41876C10.5871 5.45529 9.40587 5.82748 8.38934 6.4941C7.37281 7.16072 6.56067 8.09574 6.0429 9.19558C5.52513 10.2954 5.32195 11.5171 5.45586 12.7253C5.58977 13.9335 6.05556 15.0811 6.8016 16.0409C7.54765 17.0006 8.54483 17.7351 9.68266 18.1629C10.4891 18.4662 11.3439 18.607 12.1984 18.5812C12.7821 18.5636 13.3379 18.9296 13.4486 19.5029L13.5057 19.7987Z" fill="white"></path><path d="M11.6355 11.6207C11.128 13.9678 11.204 16.0886 11.6355 16.6568C12.5177 17.8187 14.7258 16.3916 14.9838 20.275C15.0513 21.2916 20.8547 17.5639 20.9868 11.9471C21.1059 6.88685 18.8807 10.7252 17.4109 10.4313C17.3888 10.4268 17.1703 10.381 16.4725 10.233C15.7747 10.085 14.6311 10.233 14.1465 10.3255C14.1025 10.1053 13.9483 9.51407 13.684 8.91143C13.3536 8.15812 12.2699 8.68676 11.6355 11.6207Z" fill="white"></path><circle cx="17.2202" cy="13.282" r="1.40088" fill="#1A73E8"></circle><circle cx="14.5243" cy="12.6476" r="1.24229" fill="#1A73E8"></circle></svg></div></a>`;
            let l = nWrap.childNodes[0];
            e.appendChild(l);
            nWrap.remove();
        },

        // УДАЛЯЕМ СТАНДАРТНЫЕ SUBMIT-КНОПКИ ВО ВСТРОЕННЫХ ФОРМАХ
        P = e => {
            e.forEach(e => e.querySelector(".tn-form__submit")?.remove());
        },

        // ПЕРЕПАКОВКА БЛОКОВ В POPUP-РЕЖИМЕ
        D = () => {
            let eHeader = document.querySelector(c),
                tProducts = document.querySelectorAll(n),
                rEmpty = document.querySelector(l),
                aSuccess = document.querySelector(i),
                oOrder = document.querySelector(u),
                wrap = document.createElement("div");

            wrap.classList.add("custom-cart-popup");
            eHeader && wrap.appendChild(eHeader);
            tProducts.forEach(e => wrap.appendChild(e));
            rEmpty && wrap.appendChild(rEmpty);
            aSuccess && wrap.appendChild(aSuccess);
            oOrder && wrap.appendChild(oOrder);

            let dWin = document.querySelector(".t706__cartwin"),
                sContent = document.querySelector(".t706__cartwin-content");

            dWin && dWin.appendChild(wrap);
            sContent && sContent.setAttribute("style", "display: none;");
        },

        // ПОВЕДЕНИЕ ИКОНКИ КОРЗИНЫ (для статической / popup страницы)
        F = () => {
            let e = document.querySelector(".t706__carticon-wrapper");
            e &&
                e.addEventListener("click", ev => {
                    if ("static" === r) {
                        ev.preventDefault();
                        ev.stopPropagation();
                        window.location.href = a;
                    }
                });
        },

        // ДОБАВЛЕНИЕ CSS В HEAD
        H = () => {
            let e = document.querySelector("head"),
                t = document.createElement("div");
            t.innerHTML = `<style rel="stylesheet">
                ${n}, ${l}, ${i} { display: none; }
                ${n}--clone { display: block; }
                .showed { display: block; }
                .custom-cart-popup { padding: 4rem 0; }
                ${u}__submit,
                ${n}__remove { cursor: pointer; }
                ${n}__img .tn-atom { background-size: cover; }
            </style>`;
            let r = t.childNodes[0];
            e.appendChild(r);
            t.remove();
        };

    e.tkCart = {
        init: _,
    };
}(window);
