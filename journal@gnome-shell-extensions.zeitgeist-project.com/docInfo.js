/* -*- mode: js2; js2-basic-offset: 4; indent-tabs-mode: nil -*- */

const Gio = imports.gi.Gio;
const St = imports.gi.St;
const Search = imports.ui.search;
const GtkClutter = imports.gi.GtkClutter;

const GdkPixbuf = imports.gi.GdkPixbuf;
const GnomeDesktop = imports.gi.GnomeDesktop;

function ZeitgeistItemInfo(event) {
    this._init(event);
}

ZeitgeistItemInfo.prototype = {
    _init : function(event) {
        this.event = event;
        this.subject = event.subjects[0];
        this.timestamp = event.timestamp;
        this.name = this.subject.text;
        this._lowerName = this.name.toLowerCase();
        this.uri = this.subject.uri;
        if (this.event.actor == "application://banshee.desktop")
            this.subject.mimetype = "audio/mpeg";
        this.mimeType = this.subject.mimetype;
        this.interpretation = this.subject.interpretation;
    },

    createIcon : function(size) {
        // this needs to use gnome-desktop for its interface...?? as this function has been removed from gnome-shell
//        global.log(size);
//        global.log(this.uri);
//        global.log(this.subject.mimetype);
//        let pb = GdkPixbuf.Pixbuf.new_from_file_at_size("/home/tobias/giggle.svg", size, size);
//        return pb;
        //let x = St.TextureCache.get_default();//.load_thumbnail(size, this.uri, this.subject.mimetype);
        //let x = St.TextureCache.get_default().load_file_to_cogl_texture("/home/tobias/giggle.svg");//.load_thumbnail(size, this.uri, this.subject.mimetype);
        //let x = St.TextureCache.get_default().load_uri_async(this.uri, size, size);
//        let x = St.TextureCache.get_default().load_uri_async("file:///home/tobias/giggle.svg", size, size);
//        return x;
        let thumbFactory = GnomeDesktop.DesktopThumbnailFactory.new(GnomeDesktop.DesktopThumbnailSize.LARGE);
        // attempt to copy gnome-shell stuff
        //    print(dump(thumbFactory));
        // this needs to find the mtime correctly
        var file = Gio.File.new_for_uri(this.uri);
        var file_info = file.query_info(Gio.FILE_ATTRIBUTE_TIME_MODIFIED, 0, null);// Gio.FileQueryInfoFlags.none, null));
        var mtime = file_info.get_modification_time();

        let generated_thumbnail = St.TextureCache.get_default().load_uri_async("file:///home/tobias/giggle.svg", size, size);
        existing_thumbnail = thumbFactory.lookup(this.uri, mtime);
        //global.log(existing_thumbnail);
        if (existing_thumbnail != null) {
            global.log("existing");
            //global.log(existing_thumbnail);
        } else if (thumbFactory.has_valid_failed_thumbnail(this.uri, mtime)) {
            global.log("Has failed thumbnail");
        } else if (thumbFactory.can_thumbnail(this.uri, this.mimeType, mtime)) {
            global.log(this.uri);
            global.log(this.mimeType);
            igenerated_thumbnail = thumbFactory.generate_thumbnail(this.uri, this.mimeType);
            global.log("GEN");
            global.log(igenerated_thumbnail);
            if (igenerated_thumbnail) {
                global.log("Generated thumbnail success");
                var texture = new GtkClutter.Texture();
                texture.set_from_pixbuf(igenerated_thumbnail);
                generated_thumbnail = texture;
            } else {
                global.log("Generated thumbnail fail");
            }
        } else {
            global.log("No thumbnail");
        }

        global.log("returning");
        global.log(generated_thumbnail);
        return generated_thumbnail;
    },

    launch : function() {
        Gio.app_info_launch_default_for_uri(this.uri,
                                            global.create_app_launch_context());
    },

    matchTerms: function(terms) {
        let mtype = Search.MatchType.NONE;
        for (let i = 0; i < terms.length; i++) {
            let term = terms[i];
            let idx = this._lowerName.indexOf(term);
            if (idx == 0) {
                mtype = Search.MatchType.PREFIX;
            } else if (idx > 0) {
                if (mtype == Search.MatchType.NONE)
                    mtype = Search.MatchType.SUBSTRING;
            } else {
                return Search.MatchType.NONE;
            }
        }
        return mtype;
    },
};
