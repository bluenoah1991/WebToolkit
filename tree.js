(function ($) {
    $.extend({
        ctree: function (cfg) {
            //config
            cfg.bx = !cfg.bx ? $('.ctree') : $('.' + cfg.bx);//tree shell (default : ctree)

            cfg.pn = !cfg.pn ? '<ul />' : '<' + cfg.pn + ' />';//tree parent node (default : ul)
            cfg.sn = !cfg.sn ? '<li />' : '<' + cfg.sn + ' />';//tree sub node (default : li)
            cfg.nn = !cfg.nn ? '<a />' : '<' + cfg.nn + ' />';//tree inner node (default : a)
            cfg.cpn = !cfg.cpn ? 'cpn' : cfg.cpn;//parent node style name (default : cpn)
            cfg.csn = !cfg.csn ? 'csn' : cfg.csn;//sub node style name (default : csn)
            cfg.cin = !cfg.cin ? 'cin' : cfg.cin;//inner node style name (default : cin)
            cfg.crt = !cfg.crt ? 'crt' : cfg.crt;//inner node style name (default : crt)

            cfg.clf = !cfg.clf ? 'clf' : cfg.clf;//leaf node style name (default : clf)
            cfg.lfn = !cfg.lfn ? 'lf' : cfg.lfn;//leaf node property name (default : lf)

            cfg.chk = !cfg.chk ? 0 : cfg.chk;//checkbox: 0 no 1 leaf 2 all (default : 0)
            cfg.cch = !cfg.cch ? 'cch' : cfg.cch;//checkbox style name (default : cch)
            cfg.rel = typeof (cfg.rel) == 'undefined' ? false : cfg.rel;//whether or not checkbox relation


            cfg.dpn = !cfg.dpn ? 'dpn' : cfg.dpn;//display property name (default : dpn)

            cfg.tp = !cfg.tp ? {} : cfg.tp;//postback data template
            cfg.tep = function () { }//data template class
            cfg.tep.prototype = cfg.tp;

            cfg.k = !cfg.k ? 'k' : cfg.k;//key property name (default : k)
            cfg.pk = !cfg.pk ? 'pk' : cfg.pk;//parent key property name (default : pk)
            cfg.id = !cfg.id ? {} : cfg.id;//ajax init post data (default : empty)
            cfg.u = !cfg.u ? '' : cfg.u;//ajax url address (default : empty)
            cfg.hd = !cfg.hd ? function () { } : cfg.hd;//ajax successful handle
            cfg.er = !cfg.er ? function () { } : cfg.er;//ajax error handle

            cfg.nd = [];//node list
            cfg.nc = [];//node content list
            cfg.ctr = [];//checkbox tree

            cfg.ckh = !cfg.ckh ? function () { } : cfg.ckh;//checkbox changed event handle
            cfg.all;//all the tree

            cfg.frk;//fork result

            cfg.fork = function (cd) {
                var that = this;
                if (typeof cd !== 'undefined') {
                    this.all.hide();
                    $.ajax({
                        type: "POST",
                        url: this.u,
                        data: cd,
                        dataType: "json",
                        success: function (dat) {
                            that.frk = rend(that, toJson(dat));
                            that.hd(dat);
                        },
                        error: this.er
                    });
                    return;
                }
                if (typeof this.frk !== 'undefined') {
                    this.frk.remove();
                }
                this.all.show();
            }

            cfg.set = function (b) {
                (function f(l, b, cfg) {
                    for (var j in l) {
                        var d = l[j].p.attr('checked') == 'checked';
                        if (d ^ b) {
                            l[j].p.attr('checked', b);
                            cfg.ckh(b, l[j].p, l[j].d);
                        }
                        f(l[j].l, b, cfg);
                    }
                })(this.ctr, b, this);
            }


            function toJson(str) {
                if (typeof str === 'string' && str != '') {
                    return (new Function("return " + str))();
                }
                return str;
            }

            function rend(cfg, dat, pk) {
                var box = cfg.bx;
                if (typeof pk !== 'undefined') {
                    box = cfg.nd[pk];
                }
                var pn = $(cfg.pn, { 'pk': pk, 'class': cfg.cpn });
                if (typeof pk === 'undefined' && typeof cfg.all === 'undefined') {
                    cfg.all = pn;
                }
                for (var i in dat) {
                    var k = '_' + dat[i][cfg.k];
                    var lf = false;
                    if (typeof dat[i][cfg.lfn] !== 'undefined') {
                        lf = dat[i][cfg.lfn];
                    }
                    var sn = $(cfg.sn, { 'k': k, 'class': cfg.csn });
                    if (typeof pk === 'undefined') {
                        sn.addClass(cfg.crt);
                    }
                    if (lf) {
                        sn.addClass(cfg.clf);
                    }
                    cfg.nd[k] = sn;
                    if ((cfg.chk == 1 && lf) || cfg.chk == 2) {
                        var chk = $('<input />',
                            { 'k': k, 'type': 'checkbox', 'class': cfg.cch });
                        if (cfg.rel && cfg.chk == 2) {
                            var wrap = { p: chk, l: [], d: dat[i] };
                            cfg.ctr[k] = wrap;
                            if (typeof pk !== 'undefined' &&
                                typeof cfg.ctr[pk] !== 'undefined') {
                                var b = cfg.ctr[pk].p.attr('checked') == 'checked';
                                chk.attr('checked', b);
                                cfg.ckh(b, chk, dat[i]);
                                cfg.ctr[pk].l[k] = wrap;
                            }
                            (function (k) {
                                chk.change(function () {
                                    var b = $(this).attr('checked') == 'checked';
                                    cfg.ckh(b, cfg.ctr[k].p, cfg.ctr[k].d);
                                    if (typeof cfg.ctr[k] !== 'undefined') {
                                        var l = cfg.ctr[k].l;
                                        (function f(l, b) {
                                            for (var j in l) {
                                                var d = l[j].p.attr('checked') == 'checked';
                                                if (d ^ b) {
                                                    l[j].p.attr('checked', b);
                                                    cfg.ckh(b, l[j].p, l[j].d);
                                                }
                                                f(l[j].l, b);
                                            }
                                        })(l, b);
                                    }
                                });
                            })(k);
                        }
                        sn.append(chk);
                    }
                    var n = $(cfg.nn, { 'k': k, 'class': cfg.cin });
                    if (lf) {
                        n.addClass(cfg.clf);
                    }
                    n.text(dat[i][cfg.dpn]);
                    if (!lf) {
                        (function (sn, k) {
                            n.click(function () {
                                if (typeof sn.sw === 'undefined' || sn.sw == 0) {
                                    sn.sw = 1;
                                    opn(cfg, k);
                                    return;
                                }
                                if (typeof sn.sw !== 'undefined' && sn.sw == 2) {
                                    sn.sw = 1;
                                    cls(cfg, k);
                                    return;
                                }
                            });
                        })(sn, k);
                    }
                    sn.append(n);
                    pn.append(sn);
                }
                cfg.nc[pk] = pn;
                box.append(pn);
                return pn;
            }

            function opn(cfg, pk) {
                var nd = cfg.nd[pk];
                if (typeof nd === 'undefined') {
                    return;
                }
                var ctn = cfg.nc[pk];
                if (typeof ctn !== 'undefined') {
                    ctn.css({ 'display': 'block' });//todo
                    nd.sw = 2;
                    return;
                }
                var dat = new cfg.tep();
                dat[cfg.pk] = pk.substr(1);
                $.ajax({
                    type: "POST",
                    url: cfg.u,
                    data: dat,
                    dataType: "json",
                    success: function (dat) {
                        rend(cfg, toJson(dat), pk);
                        nd.sw = 2;
                        cfg.hd(dat);
                    },
                    error: cfg.er
                });
            }

            function cls(cfg, pk) {
                var nd = cfg.nd[pk];
                if (typeof nd === 'undefined') {
                    return;
                }
                var ctn = cfg.nc[pk];
                if (typeof ctn !== 'undefined') {
                    ctn.css({ 'display': 'none' });//todo
                }
                nd.sw = 0;
            }

            //init call
            (function (cfg) {
                $.ajax({
                    type: "POST",
                    url: cfg.u,
                    data: cfg.id,
                    dataType: "json",
                    success: function (dat) {
                        rend(cfg, toJson(dat));
                        cfg.hd(dat);
                    },
                    error: cfg.er
                });
            })(cfg);

            return cfg;
        }
    });
}(jQuery));
