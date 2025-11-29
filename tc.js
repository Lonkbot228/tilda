! function(e) {
    let t = !1,
        r = "popup",
        a = "/cart",
        o = "normal",
        c = ".uc-custom-header",
        n = ".uc-custom-product",
        l = ".uc-empty-cart",
        i = ".uc-custom-success",
        u = ".uc-custom-orderform",
        _ = (e = {}) => {
            t = e.useCustomSubmit || t, r = e.cartMode || r, a = e.cartPageUrl || a, o = e.labelMode || o, c = e.cartHeaderClass || c, n = e.cartProductClass || n, l = e.cartEmptyClass || l, i = e.cartSuccessClass || i, u = e.cartOrderClass || u, H(), t_onReady(() => {
                t_onFuncLoad("tcart__reDrawProducts", () => {
                    let e = setInterval(() => {
                        window.tcart && (clearInterval(e), F(), ("static" === r && window.location.pathname === a || "popup" === r) && (tcart__reDrawProducts(), E(), q(), w(), F(), "popup" === r && D()))
                    }, 100)
                })
            })
        },
        d = (e, t) => {
            e.parentNode.insertBefore(t, e.nextSibling)
        },
        s = (e, t) => "object" != typeof e || null === e ? e : new Proxy(e, {
            set: (e, r, a) => (e[r] = a, t(e), !0),
            get: (e, r) => "object" == typeof e[r] && null !== e[r] ? s(e[r], t) : e[r]
        }),
        [p, $, m] = (e => {
            let t = e,
                r = [],
                a = e => {
                    t = e, r.forEach(e => e(t))
                },
                o = e => {
                    r.push(e)
                };
            return [() => t, a, o]
        })([]),
        y = (e, t, r) => {
            let a = document.querySelector(n),
                o = a.cloneNode(!0);
            o.querySelector(`${n}__img .tn-atom`).setAttribute("style", `background-image:url('${e.img}');`), o.querySelector(`${n}__name .tn-atom`).innerText = e.name, o.querySelector(`${n}__sku .tn-atom`).innerText = e.sku, o.querySelector(`${n}__quantity [name="quantity"]`).value = e.quantity, o.querySelector(`${n}__amount .tn-atom`).innerText = `${t} ${new Intl.NumberFormat("ru-RU").format(e.amount)} ${r}`;
            let c = o.querySelector(`${n}__name .tn-atom`);
            return nameWrapper = `<a href=${e.url} style='color: inherit;text-decoration: inherit;'>${c.innerHTML}</a>`, c.innerHTML = nameWrapper, o.querySelector(`${n}__quantity .t-inputquantity__btn-plus`).addEventListener("click", () => {
                g(e.index)
            }), o.querySelector(`${n}__quantity .t-inputquantity__btn-minus`).addEventListener("click", () => {
                b(e)
            }), o.querySelector(`${n}__quantity  [name="quantity"]`).addEventListener("focusout", t => {
                C(t, e)
            }), o.querySelector(`${n}__remove`).addEventListener("click", () => {
                S(e.index)
            }), o.querySelector(`${n}__quantity  [name="quantity"]`).onkeydown = function(e) {
                "Enter" == e.key && e.preventDefault()
            }, o
        },
        h = e => {
            let t = document.querySelector(l);
            if (!t) return console.error(`Не найден блок, появляющийся при пустой корзине. Перепроверьте наличие этого блока и его класса ${l}`);
            let r = document.querySelectorAll(`${n}--clone`);
            if (r.forEach(e => e.remove()), 0 === e.products.length) {
                t.classList.add("showed");
                return
            }
            t.classList.remove("showed"), document.querySelector(n), e.products.forEach(t => {
                let r = y(t, e.currency_txt_l, e.currency_txt_r);
                r.classList.add(`${n.slice(1)}--clone`);
                let a = Array.from(document.querySelectorAll(n)).pop();
                d(a, r)
            })
        },
        f = e => {
            document.querySelector(u);
            let t = document.querySelector(`${u} ${u}__amount .tn-atom`);
            t.innerText = `${e.currency_txt_l} ${new Intl.NumberFormat("ru-RU").format(e.amount)} ${e.currency_txt_r}`
        },
        v = e => {
            h(e), f(e)
        };
    m(v), window.addEventListener("resize", () => setTimeout(() => {
        v(p())
    }, 1e3));
    let q = () => {
            let e = {
                amount: window.tcart.amount,
                currency: window.tcart.currency,
                currency_txt_l: window.tcart.currency_txt_l,
                currency_txt_r: window.tcart.currency_txt_r,
                delivery: window.tcart.delivery,
                promocode: window.tcart.promocode,
                products: window.tcart.products.map((e, t) => ({
                    index: t,
                    img: e.img,
                    name: e.name,
                    amount: e.amount,
                    sku: e.sku,
                    quantity: e.quantity,
                    url: e.url,
                    uid: e.uid
                }))
            };
            $(e)
        },
        S = e => {
            let t = document.querySelector(`.t706__product[data-cart-product-i="${e}"]`);
            t || (tcart__reDrawProducts(), t = document.querySelector(`.t706__product[data-cart-product-i="${e}"]`)), t || console.error("Не удалось найти продукт в корзине"), tcart__product__del(t), tcart__reDrawProducts()
        },
        g = e => {
            let t = document.querySelector(`.t706__product[data-cart-product-i="${e}"]`);
            t || (tcart__reDrawProducts(), t = document.querySelector(`.t706__product[data-cart-product-i="${e}"]`)), t || console.error("Не удалось найти продукт в корзине"), tcart__product__plus(t)
        },
        b = e => {
            let t = document.querySelector(`.t706__product[data-cart-product-i="${e.index}"]`);
            t || (tcart__reDrawProducts(), t = document.querySelector(`.t706__product[data-cart-product-i="${e.index}"]`)), t || console.error("Не удалось найти продукт в корзине"), tcart__product__minus(t), 1 === e.quantity && tcart__reDrawProducts()
        },
        C = (e, t) => {
            let r = document.querySelector(`.t706__product[data-cart-product-i="${t.index}"]`);
            r || (tcart__reDrawProducts(), r = document.querySelector(`.t706__product[data-cart-product-i="${t.index}"]`)), r || console.error("Не удалось найти продукт в корзине");
            let a = parseInt(e.target.value, 10);
            tcart__product__updateQuantity(r, r, t.index, a > 0 ? a : 1)
        },
        E = () => {
            window.tcart = s(window.tcart, q)
        },
        w = () => {
            let e = document.querySelectorAll(`${u} ${u}__form`);
            if (e.length > 1) {
                let r = k(e);
                P(e), M(r, `${u}__submit`)
            }
            let a = [];
            e.forEach(e => a.push(e.querySelector("form"))), t && 1 === e.length && (P(e), M(a[0], `${u}__submit`)), t || 1 !== e.length || M(a[0], ".tn-form__submit"), A(), T()
        },
        k = e => {
            let t = document.querySelector(`${u} .t396__artboard`),
                r = document.createElement("div");
            r.innerHTML = '<form id="customForm" action="https://forms.tildacdn.com/procces/" method="POST" role="form" data-formactiontype="2" data-inputbox=".t-input-group" data-success-callback="t396_onSuccess" data-success-popup="y" data-error-popup="y"></form>';
            let a = r.childNodes[0];
            return e.forEach(e => a.appendChild(e)), t.appendChild(a), a
        },
        x = e => {
            let t = e?.closest(".t-input-group");
            return t || console.error(`Не смогли найти родительский t-input-group блок инпута`, e, "\nОбратитесь разработчику: bystricky@tonky-kot.ru")
        },
        L = e => {
            let t = e.dataset.fieldType,
                r = e.getAttribute("class").split(" ")[1].split("_")[1];
            return t || r
        },
        A = () => {
            let e = document.querySelectorAll(`${u} .t-input-block input, ${u} .t-input-block textarea, ${u} .t-input-block select`),
                t = new Set;
            e.forEach(e => {
                let r = e.getAttribute("name");
                if (!r) return !0;
                t.add(r)
            }), t.forEach(e => {
                let t = document.querySelectorAll(`${u} [name="${e}"]`),
                    r = "sf" === e ? document.querySelectorAll('.t706__orderform [data-field-type="sf"] input') : document.querySelectorAll(`.t706__orderform [name="${e}"]`),
                    a = x(t[0]),
                    o = x(r[0]),
                    c = L(a),
                    n = L(o);
                if (c !== n && !["dl", "sf"].includes(n)) return console.error("Разные типы полей. Перепроверьте, одинаковые ли вы проставили variable для полей зеро блока и корзины", t[0], r[0]);
                if (t[0].onkeydown = function(e) {
                        if ("Enter" == e.key) {
                            let t = document.querySelector(`${u} [type="submit"]`);
                            t.dispatchEvent(new Event("click"))
                        }
                    }, ["em", "ph", "nm", "in", "ta", "sb", "da", "tm", "ur", "sf"].includes(c)) return "tm" === c ? (t[0].addEventListener("keyup", e => {
                    r[0].value = e.target.value
                }), !0) : (t[0].addEventListener("change", e => {
                    if (r[0].value = e.target.value, "ph" === c) {
                        let t = e.target.parentNode.querySelector('.js-phonemask-result[type="hidden"]');
                        t && e.target.value !== t.value && t.dispatchEvent(new Event("change"))
                    }
                }), !0);
                if (["cb"].includes(c)) return t[0].addEventListener("change", e => {
                    r[0].checked = e.target.checked
                }), !0;
                if (["rd", "ri", "dl"].includes(c)) {
                    if ("cb" === o.dataset.fieldRadcb) {
                        if (!t[0]) return console.error("Не смогли найти инпут чекбоксов для переменной:", e);
                        let l = t[0].value,
                            i = new MutationObserver(e => {
                                e.forEach(e => {
                                    "attributes" === e.type && "value" === e.attributeName && t[0].value !== l && (l = t[0].value, t[0].dispatchEvent(new Event("change")))
                                })
                            });
                        i.observe(t[0], {
                            attributes: !0
                        }), t[0].addEventListener("change", e => r[0].value = t[0].value)
                    }
                    return t.forEach(e => {
                        e.addEventListener("change", t => {
                            let r = e.parentNode.parentNode.querySelector(".t-input__own-answer"),
                                a = o.querySelector(".t-input-ownanswer");
                            if (r) {
                                if (!a) return console.error("Не смогли найти инпут своего варианта ответа в корзине");
                                r.addEventListener("change", e => a.value = e.target.value)
                            }
                            let c = document.querySelector(`.t706__orderform [value*="${e.value}"]`);
                            if (!c) return console.error("Не смогли найти радиокнопки в корзине с таким значением:", e.value);
                            c.checked = t.target.checked, c.dispatchEvent(new Event("change"))
                        })
                    }), !0
                }
            })
        },
        T = () => {
            let e = window.tcart_success;
            Object.defineProperty(window, "tcart_success", {
                get: () => e,
                set(r) {
                    e = r, "yes" === r && t()
                }
            });
            let t = () => {
                let e = document.querySelector(".t706__carticon");
                e && e.classList.remove("t706__carticon_showed");
                let t = document.querySelector(l);
                if (!t) return console.error(`Не найден блок, появляющийся при пустой корзине. Перепроверьте наличие этого блока и его класса ${l}`);
                let r = document.querySelector(i);
                if (r) {
                    let a = document.querySelectorAll(`${n}--clone`);
                    a.forEach(e => e.remove()), t.classList.remove("showed"), r.classList.add("showed");
                    return
                }
                let o = p(),
                    c = {
                        ...o,
                        products: []
                    };
                $(c)
            }
        },
        M = (e, t) => {
            let r = document.querySelector(`${u} ${t}`),
                a = document.querySelector(".t706__orderform form");
            return r ? a ? void(r.setAttribute("type", "submit"), N(r), r.addEventListener("click", t => {
                if ("tk-label" === t.target.id) return;
                t.preventDefault(), t.stopPropagation();
                let r = 0 === p().products.length;
                if (r) return alert("Cart is empty");
                window.tildaForm.hideErrors(e);
                let o = window.tildaForm.validate(e);
                if (o.length) {
                    window.tildaForm.showErrors(e, o);
                    return
                }
                a.dispatchEvent(new Event("submit"))
            })) : console.error("Не удалось найти форму корзины. Возможно, на странице отсутствует блок ST100") : console.error(`Не удалось найти кастомную кнопку submit. Перепроверьте наличие кнопки с классом ${u}__submit в зеро блоке с классом ${u}`)
        },
        N = e => {
            let [t, r, a, c] = "big" === o ? ["1rem", "0.5rem", "1.35rem", ""] : "normal" === o ? ["0.875rem", "0.25rem", "1.25rem", ""] : "tiny" === o ? ["0.75rem", "0.25rem", "1rem", ""] : "hidden" === o ? ["0.75rem", "0.25rem", "1rem", "opacity: 0 !important; pointer-events: none !important;"] : void 0, n = document.createElement("div");
            n.innerHTML = `<a href="https://tonky-kot.ru?utm_source=${window.location.host}&utm_campaign=cart" target="_blank" id="tk-label"  style="color: #8b8b8b !important; font-size: ${t} !important; font-family: Arial, sans-serif !important; display: flex !important; gap: ${r} !important; align-items: center !important; left: 0 !important; top: calc(100% + ${t}) !important; position: absolute !important; white-space: nowrap !important; ${c}" onMouseOver="this.style.textDecoration='underline'" onMouseOut="this.style.textDecoration='none'">Корзина сделана с помощью<div style="width: ${a}; height: ${a};"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24" rx="12" fill="#1A73E8"></rect><path d="M13.5057 19.7987C13.6164 20.372 13.2409 20.9331 12.6586 20.9759C11.3625 21.071 10.0567 20.8845 8.83242 20.4242C7.2771 19.8393 5.91405 18.8354 4.89428 17.5235C3.8745 16.2116 3.23782 14.643 3.05478 12.9915C2.87173 11.3399 3.14946 9.66998 3.8572 8.16661C4.56494 6.66325 5.67506 5.38516 7.06456 4.47395C8.45406 3.56274 10.0687 3.05399 11.7296 3.00406C13.3905 2.95414 15.0327 3.36498 16.4745 4.19108C17.6093 4.84135 18.585 5.72893 19.3376 6.78849C19.6757 7.26455 19.4824 7.9114 18.97 8.19139L18.7057 8.33585C18.1933 8.61584 17.5571 8.42065 17.1988 7.9596C16.6742 7.28463 16.021 6.71551 15.2734 6.28716C14.2187 5.6828 13.0172 5.38223 11.8022 5.41876C10.5871 5.45529 9.40587 5.82748 8.38934 6.4941C7.37281 7.16072 6.56067 8.09574 6.0429 9.19558C5.52513 10.2954 5.32195 11.5171 5.45586 12.7253C5.58977 13.9335 6.05556 15.0811 6.8016 16.0409C7.54765 17.0006 8.54483 17.7351 9.68266 18.1629C10.4891 18.4662 11.3439 18.607 12.1984 18.5812C12.7821 18.5636 13.3379 18.9296 13.4486 19.5029L13.5057 19.7987Z" fill="white"></path><path d="M11.6355 11.6207C11.128 13.9678 11.204 16.0886 11.6355 16.6568C12.5177 17.8187 14.7258 16.3916 14.9838 20.275C15.0513 21.2916 20.8547 17.5639 20.9868 11.9471C21.1059 6.88685 18.8807 10.7252 17.4109 10.4313C17.3888 10.4268 17.1703 10.381 16.4725 10.233C15.7747 10.085 14.6311 10.233 14.1465 10.3255C14.1025 10.1053 13.9483 9.51407 13.684 8.91143C13.3536 8.15812 12.2699 8.68676 11.6355 11.6207Z" fill="white"></path><circle cx="17.2202" cy="13.282" r="1.40088" fill="#1A73E8"></circle><circle cx="14.5243" cy="12.6476" r="1.24229" fill="#1A73E8"></circle></svg></div></a>`;
            let l = n.childNodes[0];
            e.appendChild(l), n.remove()
        },
        P = e => {
            e.forEach(e => e.querySelector(".tn-form__submit")?.remove())
        },
        D = () => {
            let e = document.querySelector(c),
                t = document.querySelectorAll(n),
                r = document.querySelector(l),
                a = document.querySelector(i),
                o = document.querySelector(u),
                _ = document.createElement("div");
            _.classList.add("custom-cart-popup"), _.appendChild(e), t.forEach(e => {
                _.appendChild(e)
            }), _.appendChild(r), _.appendChild(a), _.appendChild(o);
            let d = document.querySelector(".t706__cartwin"),
                s = document.querySelector(".t706__cartwin-content");
            d.appendChild(_), s.setAttribute("style", "display: none;")
        },
        F = () => {
            let e = document.querySelector(".t706__carticon-wrapper");
            e && e.addEventListener("click", e => {
                "static" === r && (e.preventDefault(), e.stopPropagation(), window.location.href = a)
            })
        },
        H = () => {
            let e = document.querySelector("head"),
                t = document.createElement("div");
            t.innerHTML = `<style rel="stylesheet">${n}, ${l}, ${i} { display: none; } ${n}--clone { display: block; } .showed { display: block; } .custom-cart-popup { padding: 4rem 0; } ${u}__submit, ${n}__remove { cursor: pointer } ${n}__img .tn-atom { background-size: cover; }</style>`;
            let r = t.childNodes[0];
            e.appendChild(r), t.remove()
        };
    e.tkCart = {
        init: _
    }
}(window);
