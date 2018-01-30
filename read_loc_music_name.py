# -*- coding: utf-8 -*- 

import os
import chardet

def read_music_name():
    path = "music"
    music_list = []
    for file in os.listdir(path):
        music_list.append(file)
    return music_list

def read_js():
    music_list = read_music_name()

    js_content = []
    with open("./js/script.js",'r',encoding= 'utf8') as f:
        js_content = f.readlines()
    
    artist_title_list = []
    for full_name in music_list:
        full_name = full_name.strip()
        artist_title = full_name.split(' - ', 1)
        artist_title_list.append(artist_title)
    # print(artist_title_list)
    
    for artist_title in artist_title_list:
        artist = artist_title[0]
        title = artist_title[1].strip('.mp3')
        js_content.insert(7,"{\"title\": \"%s\" , \"artist\": \"%s\"}," % (title, artist))
    with open("./js/script.js",'w',encoding= 'utf8') as f:
        s = ''.join(js_content)
        f.write(s)

if __name__ == '__main__':
    read_js()
