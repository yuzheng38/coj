import os
import docker
import shutil
import uuid 

from docker.errors import APIError
from docker.errors import ContainerError
from docker.errors import ImageNotFound

client = docker.from_env()

IMAGE_NAME = 'shyin/cs503-2017'
CURRENT_DIR = os.path.dirname(os.path.relpath(__file__))
TEMP_BUILD_DIR = '%s/tmp/' % CURRENT_DIR

SOURCE_FILE_NAMES = {
    'java':'Solution.java',
    'python':'solution.py'
}

SOURCE_BINARY_NAMES = {
    'java':'Solution',
    'python': 'solution.py'
}

BUILD_COMMANDS = {
    'java': 'javac',
    'python': 'python'
}

EXECUTE_COMMANDS = {
    'java': 'java',
    'python': 'python'
}

def load_image():
    try:
        client.images.get(IMAGE_NAME)
        print 'image exists already'
    except ImageNotFound:
        print 'image not found locally, pulling from docker hub...'
        client.images.pull(IMAGE_NAME)
    except APIError:
        print 'image not found'
        return
    print 'image loaded'

def make_dir(dir):
    try:
        os.mkdir(dir)
        print 'temp build dir [%s] created ' % dir
    except OSError:
        print 'temp build dir [%s] exists. ' % dir

def repl(code, lang):
    result = {'build': None, 'run': None}
    source_file_parent_dir_name = uuid.uuid4()
    source_file_host_dir = '%s/%s' % (TEMP_BUILD_DIR, source_file_parent_dir_name)

    source_file_guest_dir = '/test/%s' % (source_file_parent_dir_name)

    make_dir(source_file_host_dir)

    with open('%s/%s' % (source_file_host_dir, SOURCE_FILE_NAMES[lang]), 'w') as source_file:
        source_file.write(code)

    try:
        client.containers.run(
            image=IMAGE_NAME,
            command="%s %s" % (BUILD_COMMANDS[lang], SOURCE_FILE_NAMES[lang]),
            volumes={source_file_host_dir: {'bind': source_file_guest_dir, 'mode': 'rw'}},
            working_dir=source_file_guest_dir
        )
        print 'source built'
        result['build'] = 'ok'
    except ContainerError as e:
        print 'source build failed'
        result['build'] = e.stderr
        shutil.rmtree(source_file_host_dir)
        return result

    try:
        log = client.containers.run(
            image=IMAGE_NAME,
            command="%s %s" % (EXECUTE_COMMANDS[lang], SOURCE_BINARY_NAMES[lang]),
            volumes={source_file_host_dir: {'bind': source_file_guest_dir, 'mode': 'rw'}},
            working_dir=source_file_guest_dir
        )
        print 'executed'
        result['run'] = log
    except ContainerError as e:
        print 'execution failed'
        result['run'] = e.stderr
        shutil.rmtree(source_file_host_dir)
        return result

    shutil.rmtree(source_file_host_dir)
    return result