import click
from utils import initiate, checkcred
from utils import deploy as deploy_util
from pyfiglet import Figlet


def print_quicli():
    f = Figlet(font='slant')
    click.echo(f.renderText('QuiCLI'))


@click.group()
def main():
    pass


@main.command()
def authorize():
    print_quicli()
    initiate()


@main.command()
def check():
    print_quicli()
    checkcred()


@main.command()
def deploy():
    deploy_util()


if __name__ == "__main__":
    main()
