(function ($) {
    $.extend({
        cpagination: function (cfg) {
            //config
            cfg.bx = !cfg.bx ? $('.cpg') : $('.' + cfg.bx);//pagination shell (default : cpg)

            cfg.it = !cfg.it ? '<li />' : '<' + cfg.it + ' />';//pagination item (default : li)
            cfg.ct = !cfg.ct ? 'cpg_it' : cfg.ct;//pagination item css name (default : cpg_it)
            cfg.ht = !cfg.ht ? 'cpg_ht' : cfg.ht;//pagination active item css name (default : cpg_ht)
            cfg.ft = !cfg.ft ? 'cpg_ft' : cfg.ft;//first button css name (default : cpg_ft)
            cfg.lt = !cfg.lt ? 'cpg_lt' : cfg.lt;//last button css name (default : cpg_lt)
            cfg.pv = !cfg.pv ? 'cpg_pv' : cfg.pv;//prev button css name (default : cpg_pv)
            cfg.nt = !cfg.nt ? 'cpg_nt' : cfg.nt;//next button css name (default : cpg_nt)
            cfg.hb = !cfg.hb ? 'cpg_hb' : cfg.hb;//fix button active css name (default : cpg_hb)
            cfg.ftp = !cfg.ftp ? '<<' : cfg.ftp;//first button plain
            cfg.ltp = !cfg.ltp ? '>>' : cfg.ltp;//last button plain
            cfg.pvp = !cfg.pvp ? '<' : cfg.pvp;//prev button plain
            cfg.ntp = !cfg.ntp ? '>' : cfg.ntp;//next button plain

            cfg.tp = !cfg.tp ? {} : cfg.tp;//postback data template
            cfg.tep = function () { }//data template class
            cfg.tep.prototype = cfg.tp;

            cfg.u = !cfg.u ? '' : cfg.u;//ajax url address (default : empty)
            cfg.id = !cfg.id ? {} : cfg.id;//ajax init post data (default : empty)
            cfg.fr = typeof (cfg.fr) == 'undefined' ? false : cfg.fr;//first page number (false : first page  true : last page)
            cfg.sz = !cfg.sz ? 10 : cfg.sz;//page size (default : 10)
            cfg.sh = !cfg.sh ? 5 : cfg.sh;//show page number (default : 5)
            cfg.er = !cfg.er ? function () { } : cfg.er;//ajax error handle
            cfg.hd = !cfg.hd ? function () { } : cfg.hd;//data handle
            cfg.c = 0;//total data
            cfg.n = 1;//total pages
            cfg.i = 1;//current page
            cfg.itm = [];

            cfg.ftn = {};
            cfg.ltn = {};
            cfg.pvn = {};
            cfg.ntn = {};

            function hbs(cfg) {//setting fix button css style
                if (cfg.i == 1) {
                    cfg.ftn.removeClass(cfg.hb);
                    cfg.pvn.removeClass(cfg.hb);
                } else {
                    cfg.ftn.addClass(cfg.hb);
                    cfg.pvn.addClass(cfg.hb);
                }
                if (cfg.i == cfg.n) {
                    cfg.ltn.removeClass(cfg.hb);
                    cfg.ntn.removeClass(cfg.hb);
                } else {
                    cfg.ltn.addClass(cfg.hb);
                    cfg.ntn.addClass(cfg.hb);
                }
            }

            function add(bn, i, cfg) {//add click event to bn button, i is page number
                bn.unbind();
                bn.click(function () {
                    //todo ajax post
                    cfg.i = i;
                    var dat = new cfg.tep();
                    dat.i = i;
                    $.ajax({
                        type: "POST",
                        url: cfg.u,
                        data: dat,
                        dataType: "json",
                        success: function (dat) {
                            if (!!dat.s) { cfg.sz = dat.s; }
                            trim(dat.c, cfg);
                            cfg.hd(dat.d);
                        },
                        error: cfg.er
                    });
                });
            }
            function rmv(bn) {//remove click event to bn button
                bn.unbind();
            }

            function fix(bn, typ, cfg) {//add fix button click event typ : 1 first 2 prev 3 next 4 last
                bn.unbind();
                bn.click(function () {
                    var dat = new cfg.tep();
                    switch (typ) {
                        case 1:
                            if (cfg.i == 1) { return; }
                            cfg.i = 1;
                            dat.i = 1;
                            break;
                        case 2:
                            if (cfg.i == 1) { return; }
                            cfg.i = cfg.i - 1;
                            dat.i = cfg.i;
                            break;
                        case 3:
                            if (cfg.i == cfg.n) { return; }
                            cfg.i = cfg.i + 1;
                            dat.i = cfg.i;
                            break;
                        case 4:
                            if (cfg.i == cfg.n) { return; }
                            cfg.i = cfg.n;
                            dat.i = cfg.i;
                            break;
                    }
                    $.ajax({
                        type: "POST",
                        url: cfg.u,
                        data: dat,
                        dataType: "json",
                        success: function (dat) {
                            if (!!dat.s) { cfg.sz = dat.s; }
                            trim(dat.c, cfg);
                            cfg.hd(dat.d);
                        },
                        error: cfg.er
                    });
                });
            }

            function trim(co, cfg) {//adjust to the correct location
                cfg.c = co;
                cfg.n = Math.ceil(cfg.c / cfg.sz);
                cfg.n = cfg.n > 0 ? cfg.n : 1;
                var i;
                var a = 1;
                if (cfg.n <= cfg.sh) {
                    for (; a <= cfg.n; a++) {
                        var it_btn = i_fac(a - 1, a, cfg);
                    }
                } else {
                    var off = Math.floor(cfg.sh / 2);
                    if (cfg.i <= off) {
                        for (; a <= cfg.sh; a++) {
                            var it_btn = i_fac(a - 1, a, cfg);
                        }
                    } else if (cfg.n - cfg.i + 1 <= off) {
                        for (a = cfg.sh; a > 0; a--) {
                            var it_btn = i_fac(cfg.sh - a, cfg.n - a + 1, cfg);
                        }
                    } else {
                        for (; a <= cfg.sh; a++) {
                            var it_btn = i_fac(a - 1, cfg.i - off + a - 1, cfg);
                        }
                    }
                }
                i_rea(cfg);
                hbs(cfg);
            }

            function i_fac(off, a, cfg) {//create page number button
                if (!cfg.itm[off]) {
                    cfg.itm[off] = $(cfg.it, { 'class': cfg.ct });
                }
                cfg.itm[off].text(a);//fill page number button plain
                if (a == cfg.i) { cfg.itm[off].addClass(cfg.ht); rmv(cfg.itm[off]); }
                else { cfg.itm[off].removeClass(cfg.ht); add(cfg.itm[off], a, cfg); }
                return cfg.itm[off];
            }

            function i_rea(cfg) {//rearrange button
                var n = 0;
                cfg.ftn.detach();
                cfg.pvn.detach();
                cfg.ntn.detach();
                cfg.ltn.detach();
                for (n in cfg.itm) {
                    cfg.itm[n].detach();
                }
                cfg.bx.append(cfg.ftn);
                cfg.bx.append(cfg.pvn);
                for (n in cfg.itm) {
                    cfg.bx.append(cfg.itm[n]);
                }
                cfg.bx.append(cfg.ntn);
                cfg.bx.append(cfg.ltn);
            }

            function init(co, cfg) {
                cfg.c = co;
                cfg.n = Math.ceil(cfg.c / cfg.sz);
                cfg.n = cfg.n > 0 ? cfg.n : 1;
                cfg.i = cfg.fr ? cfg.n : 1;
                var a = 1;
                if (cfg.n <= cfg.sh) {
                    for (; a <= cfg.n; a++) {
                        var it_btn = i_fac(a - 1, a, cfg);
                    }
                } else {
                    if (!cfg.fr) {
                        for (; a <= cfg.sh; a++) {
                            var it_btn = i_fac(a - 1, a, cfg);
                        }
                    } else {
                        for (a = cfg.sh; a > 0; a--) {
                            var it_btn = i_fac(cfg.sh - a, cfg.n - a + 1, cfg);
                        }
                    }
                }
                cfg.ftn = $(cfg.it, { 'class': cfg.ft }).text(cfg.ftp);
                fix(cfg.ftn, 1, cfg);
                cfg.pvn = $(cfg.it, { 'class': cfg.pv }).text(cfg.pvp);
                fix(cfg.pvn, 2, cfg);
                cfg.ntn = $(cfg.it, { 'class': cfg.nt }).text(cfg.ntp);
                fix(cfg.ntn, 3, cfg);
                cfg.ltn = $(cfg.it, { 'class': cfg.lt }).text(cfg.ltp);
                fix(cfg.ltn, 4, cfg);
                i_rea(cfg);
                hbs(cfg);
            }

            function ini(co, cfg) {
                cfg.bx.empty();
                cfg.c = 0;
                cfg.n = 1;
                cfg.i = 1;
                cfg.itm = [];
                cfg.ftn = {};
                cfg.ltn = {};
                cfg.pvn = {};
                cfg.ntn = {};

                init(co, cfg);
            }

            cfg.init = function (dat) {
                (function (cfg) {
                    $.ajax({
                        type: "POST",
                        url: cfg.u,
                        data: dat,
                        dataType: "json",
                        success: function (dat) {
                            if (!!dat.s) { cfg.sz = dat.s; }
                            ini(dat.c, cfg);
                            cfg.hd(dat.d);
                        },
                        error: cfg.er
                    });
                })(this);
            };

            //init call
            (function (cfg) {
                $.ajax({
                    type: "POST",
                    url: cfg.u,
                    data: cfg.id,
                    dataType: "json",
                    success: function (dat) {
                        if (!!dat.s) { cfg.sz = dat.s; }
                        init(dat.c, cfg);
                        cfg.hd(dat.d);
                    },
                    error: cfg.er
                });
            })(cfg);

            return cfg;
        }
    });
}(jQuery));
