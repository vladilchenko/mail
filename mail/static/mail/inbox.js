document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  document.querySelector("#compose-form").onsubmit = send_email;

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#opened-email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function reply_email(email) {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#opened-email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  if (email.subject.substring(0, 3) === "Re:") {
    subject = email.subject;
  } else {
    subject = `Re: ${email.subject}`;
  };

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = email.sender;
  document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
  document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote:\n ${email.body} \n\n`;

}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#opened-email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Fetch emails
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(data => {
    data.forEach(email => {
      if (mailbox === "inbox") {
        email_block = create_email_block(email, true, false);
        if (email.archived === false) {
          document.querySelector("#emails-view").append(email_block);
        };
      };
      if (mailbox === "sent") {
        let current_user = document.querySelector("#current_user").textContent;
        if (email.sender === current_user) {
          email_block = create_email_block(email, false, false);
          document.querySelector("#emails-view").append(email_block);
        };
      };
      if (mailbox === "archive") {
        if (email.archived === true) {
          email_block = create_email_block(email, false, true);
          document.querySelector("#emails-view").append(email_block);
        }
      };
    })
  })
  .catch(error => {
    console.log('Error:', error)
  });
}

function create_email_block(email, archive, unarchive) {
  email_block = document.createElement("div");
  email_block.addEventListener("click", event => {
    console.log(`Clicked on email ${email.id}`);
    fetch(`/emails/${email.id}`, {
      method: 'PUT',
      body: JSON.stringify({read: true})
    });
    showOpenedEmail(email.id);
  });
  email_block.classList.add("email_record");

  email_subject = document.createElement("h4");
  email_subject.innerHTML = email.subject;

  email_sender = document.createElement("p");
  email_sender.innerHTML = email.sender;

  email_date = document.createElement("p");
  email_date.innerHTML = email.timestamp;

  email_block.appendChild(email_subject);
  email_block.appendChild(email_sender);
  email_block.appendChild(email_date);

  if (unarchive === true) {
    unarchive = document.createElement("button");
    unarchive.innerHTML = "Unarchive";
    unarchive.addEventListener("click", event => {
      fetch( `/emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({archived: false, read: false})
      })
      .then(() => {
        load_mailbox("archive");
      });

      event.stopPropagation();
    });
    email_block.appendChild(unarchive)
  };
  if (archive === true) {
    // Mark as read
    if (email.read) {
      email_block.classList.add("read")
    };

    archive = document.createElement("button");
    archive.innerHTML = "Archive";
    archive.addEventListener("click", event => {
      fetch( `/emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({archived: true})
      })
      .then(result => console.log(result))
      .then(() => load_mailbox("inbox"));

      event.stopPropagation();
    });
    email_block.appendChild(archive)
  };

  return email_block
}

function send_email() {

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: document.querySelector("#compose-recipients").value,
      subject: document.querySelector("#compose-subject").value,
      body: document.querySelector("#compose-body").value
    })
  })
  .then(response => response.json())
  .then(result => {
    console.log(result);
    load_mailbox('sent');
  });

  return false;
}

function showOpenedEmail(email_id) {
  fetch(`/emails/${email_id}`)
  .then(response => response.json())
  .then(email => {
    console.log(email);

    subject = document.createElement("h3");
    subject.innerHTML = email.subject;

    from = document.createElement("h5");
    from.innerHTML = `From: ${email.sender}`;

    to = document.createElement("h5");
    to.innerHTML = `To: ${email.recipients.join(", ")}`;

    when = document.createElement("p");
    when.innerHTML = email.timestamp;

    body = document.createElement("p");
    body.innerHTML = email.body;

    reply = document.createElement("button");
    reply.innerHTML = "Reply";
    reply.addEventListener("click", () => {
      reply_email(email);
    });

    container = document.querySelector("#opened-email-view");
    container.replaceChildren(subject, from, to, when, body, reply);

    // Update view
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#opened-email-view').style.display = 'block';
  });
}
